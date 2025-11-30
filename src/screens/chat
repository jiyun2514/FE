import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Send, Mic } from 'lucide-react-native';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Gemini SDK 추가


const GEMINI_API_KEY = "여기에_GOOGLE_API_KEY_를_넣으세요"; 

type Message = {
  id: string;
  role: 'user' | 'assistant'; // UI에서는 assistant로 사용
  content: string;
};

type RootStackParamList = {
  Home: undefined;
  Chat: { mode?: string };
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  
  const initialMode = route.params?.mode || 'casual';
  const [mode, setMode] = useState(initialMode);
  
  // Gemini 인스턴스 초기화
  const genAI = useRef(new GoogleGenerativeAI(GEMINI_API_KEY)).current;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How are you today? Let\'s practice English!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'casual' ? 'formal' : 'casual'));
  };

  const handleFormSubmit = async () => {
    if (!input.trim() || isLoading) return;

    // 1. 사용자 메시지 UI에 즉시 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Gemini 모델 설정
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // 3. 대화 히스토리 변환 (OpenAI 포맷 -> Gemini 포맷)
      // Gemini는 role이 'user'와 'model'입니다.
      const history = newMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // 4. 채팅 세션 시작
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      // 5. 현재 모드(Casual/Formal)에 따른 시스템 프롬프트 주입
    
      const prompt = `${input} \n\n(Please reply in a ${mode} tone suitable for English learning. Keep it concise.)`;

      // 6. 메시지 전송 및 응답 대기
      const result = await chat.sendMessage(prompt);
      const responseText = result.response.text();

      // 7. AI 응답 UI에 추가
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Gemini API Error:', error);
      Alert.alert('Error', 'Failed to get response from AI.');
      
      // 에러 발생 시 사용자에게 재시도 요청을 위해 입력값 복구 등 처리 가능
    } finally {
      setIsLoading(false);
    }
  };

  // ... (renderItem 및 나머지 코드는 기존과 동일하게 유지)
  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageRow, 
      item.role === 'user' ? styles.userRow : styles.assistantRow
    ]}>
      <View style={[
        styles.bubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color="#2c303c" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'casual' ? '😊 Casual Mode' : '🎩 Formal Mode'}
        </Text>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={styles.modeButtonText}>모드 변경</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.mascotContainer}>
            <View style={styles.mascotCircle}>
              <Image
                source={{ uri: 'https://github.com/shadcn.png' }} 
                style={styles.mascotImage}
                resizeMode="contain"
              />
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
      />

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
              onSubmitEditing={handleFormSubmit} // 엔터 키 누르면 전송
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.micButton}>
              <Mic color="#9ca3af" size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleFormSubmit}
            disabled={!input.trim() || isLoading}
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.disabledButton]}
          >
            <Send color="#fff" size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 스타일은 원본 코드 그대로 사용 (변경 없음)
  container: {
    flex: 1,
    backgroundColor: '#e8eaf0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#d5d8e0',
    borderBottomWidth: 1,
    borderBottomColor: '#c5c8d4',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c303c',
  },
  iconButton: {
    padding: 4,
  },
  modeButtonText: {
    fontSize: 12,
    color: '#2c303c',
    textDecorationLine: 'underline',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mascotImage: {
    width: 100,
    height: 100,
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#b8bcc9',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#d5d8e0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#2c303c',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
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
  input: {
    flex: 1,
    color: '#2c303c',
    fontSize: 14,
    padding: 0,
  },
  micButton: {
    padding: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2c303c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
