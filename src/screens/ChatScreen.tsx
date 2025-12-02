// src/screens/ChatScreen.tsx
import PandaIcon from '../components/PandaIcon';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Send, Mic, Eye, Lightbulb, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import { aiApi } from '../api/Services'; 
// const TEST_USER_ID = 'test_user_123';
// === [Gemini API 통신 부분] ===
// ⚠️ API KEY 설정
const GEMINI_API_KEY = '여기에_실제_API_KEY_입력';

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// === [API 호출 함수들] ===

async function callGemini(historyForGemini: any[], prompt: string): Promise<string> {
  const contents = [...historyForGemini, { role: 'user', parts: [{ text: prompt }] }];
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 500 } }),
  });
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? ''
  );
}

// 2. 문법 피드백 요청 함수
async function getGrammarFeedback(userText: string): Promise<string> {
  const prompt = `
    Analyze the following English sentence written by a Korean student: "${userText}"
    1. Correct any grammar errors naturally.
    2. Explain the correction in Korean.
    3. If it's perfect, say "완벽한 문장입니다!" and explain why it's good.
    Output format:
    [Corrected]: (sentence)
    [Explanation]: (Korean explanation)
  `;
  return await callGemini([], prompt);
}

// 3. 답변 추천 요청 함수
async function getReplySuggestions(aiText: string): Promise<string> {
  const prompt = `
    The AI tutor said: "${aiText}"
    Suggest 3 natural English responses for a student.
    Include Korean translations.
    Format:
    1. English sentence (Korean meaning)
    2. English sentence (Korean meaning)
    3. English sentence (Korean meaning)
  `;
  return await callGemini([], prompt);
}

// 타입들
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: string | null;
  suggestion?: string | null;
  isLoadingExtra?: boolean;
};

type RootStackParamList = {
  Home: undefined;
  Chat: { mode?: string };
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const insets = useSafeAreaInsets();

  const initialMode = route.params?.mode || 'casual';
  const [mode, setMode] = useState(initialMode);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! How are you today? Let's practice English!",
      suggestion: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 스크롤 + 저장
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
    const saveChatHistory = async () => {
      try {
        if (messages.length > 0) {
          await AsyncStorage.setItem(
            'last_chat_history',
            JSON.stringify(messages),
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    saveChatHistory();
  }, [messages]);
  

  // 문법 피드백
  const handleRequestFeedback = async (messageId: string, content: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isLoadingExtra: true } : msg,
      ),
    );
    try {
      const result = await getGrammarFeedback(content);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, feedback: result, isLoadingExtra: false }
            : msg,
        ),
      );
    } catch {
      Alert.alert('Error', '피드백을 불러오지 못했습니다.');
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isLoadingExtra: false } : msg,
        ),
      );
    }
  };

  // 답변 추천
  const handleRequestSuggestion = async (messageId: string, content: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isLoadingExtra: true } : msg,
      ),
    );
    try {
      const result = await getReplySuggestions(content);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, suggestion: result, isLoadingExtra: false }
            : msg,
        ),
      );
    } catch {
      Alert.alert('Error', '추천 답변을 불러오지 못했습니다.');
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isLoadingExtra: false } : msg,
        ),
      );
    }
  };

  const handleCloseExtra = (
    messageId: string,
    type: 'feedback' | 'suggestion',
  ) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, [type]: null } : msg,
      ),
    );
  };

  const handleModeChange = () => {
    Alert.alert('회화 스타일 선택', '사용할 영어 스타일을 선택하세요.', [
      { text: '😊 Casual', onPress: () => setMode('casual') },
      { text: '🎩 Formal', onPress: () => setMode('formal') },
      { text: '취소', style: 'cancel' },
    ]);
  };
  
  const handleFormSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForGemini = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));
      const prompt = `${input}\n\n(Reply in a ${mode} tone suitable for English learning. Concise.)`;
      const responseText = await callGemini(historyForGemini, prompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to get response.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View style={{ marginBottom: 16 }}>
        <View
          style={[
            styles.messageRow,
            isUser ? styles.userRow : styles.assistantRow,
          ]}
        >
          {!isUser && (
            <TouchableOpacity
              onPress={() =>
                item.suggestion
                  ? handleCloseExtra(item.id, 'suggestion')
                  : handleRequestSuggestion(item.id, item.content)
              }
              style={styles.actionIconBtn}
              disabled={item.isLoadingExtra}
            >
              {item.isLoadingExtra ? (
                <ActivityIndicator size="small" color="#F59E0B" />
              ) : (
                <Lightbulb
                  color="#F59E0B"
                  size={20}
                  fill={item.suggestion ? '#F59E0B' : 'none'}
                />
              )}
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>

          {isUser && (
            <TouchableOpacity
              onPress={() =>
                item.feedback
                  ? handleCloseExtra(item.id, 'feedback')
                  : handleRequestFeedback(item.id, item.content)
              }
              style={styles.actionIconBtn}
              disabled={item.isLoadingExtra}
            >
              {item.isLoadingExtra ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Eye color="#6B7280" size={20} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {isUser && item.feedback && (
          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>🧐 피드백 (Grammar Check)</Text>
              <TouchableOpacity
                onPress={() => handleCloseExtra(item.id, 'feedback')}
              >
                <X size={16} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.feedbackText}>{item.feedback}</Text>
          </View>
        )}

        {!isUser && item.suggestion && (
          <View style={styles.suggestionContainer}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.suggestionTitle}>💡 이렇게 말할 수 있어요</Text>
              <TouchableOpacity
                onPress={() => handleCloseExtra(item.id, 'suggestion')}
              >
                <X size={16} color="#B45309" />
              </TouchableOpacity>
            </View>
            <Text style={styles.suggestionText}>{item.suggestion}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']} // top은 insets.top으로 처리
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <ChevronLeft color="#2c303c" size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {mode === 'casual' ? '😊 Casual Mode' : '🎩 Formal Mode'}
          </Text>

          <TouchableOpacity onPress={handleModeChange}>
            <Text style={styles.modeButtonText}>모드 변경</Text>
          </TouchableOpacity>
        </View>

        {/* 메시지 리스트 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          // ⬇️ 여기서 insets.top만큼 더 패딩 줘서 "스크롤돼도" 위로 안 붙게 함
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: 16 + insets.top },
          ]}
          ListHeaderComponent={
            <View style={styles.mascotContainer}>
              <View style={styles.mascotCircle}>
                <PandaIcon size="medium" />
              </View>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.assistantBubble}>
                  <ActivityIndicator color="#6b7280" size="small" />
                </View>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />

        {/* 입력창 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Hello, how are you today?"
                placeholderTextColor="#9ca3af"
                multiline={false}
                onSubmitEditing={handleFormSubmit}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.micButton}>
                <Mic color="#9ca3af" size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleFormSubmit}
              disabled={!input.trim() || isLoading}
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.disabledButton,
              ]}
            >
              <Send color="#fff" size={18} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8eaf0',
  },
  container: {
    flex: 1,
    backgroundColor: '#e8eaf0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#d5d8e0',
    borderBottomWidth: 1,
    borderBottomColor: '#c5c8d4',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2c303c' },
  iconButton: { padding: 4 },
  modeButtonText: {
    fontSize: 12,
    color: '#2c303c',
    textDecorationLine: 'underline',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mascotContainer: { alignItems: 'center', marginVertical: 16 },
  mascotCircle: {
    width: 128,
    height: 128,
    backgroundColor: 'white',
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#2c303c',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  messageRow: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },

  bubble: { maxWidth: '70%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#b8bcc9', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#d5d8e0', borderBottomLeftRadius: 4 },
  messageText: { color: '#2c303c', fontSize: 14, lineHeight: 20 },

  loadingContainer: { alignItems: 'flex-start', marginBottom: 10 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#d5d8e0',
    borderTopWidth: 1,
    borderTopColor: '#c5c8d4',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    marginRight: 8,
  },
  input: { flex: 1, color: '#2c303c', fontSize: 14, padding: 0 },
  micButton: { padding: 4 },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2c303c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.5 },

  actionIconBtn: {
    padding: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  feedbackContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F4F6',
    width: '85%',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  feedbackText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  suggestionContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    width: '85%',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  suggestionText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});
