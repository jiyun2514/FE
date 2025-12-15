// src/screens/ScriptScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { conversationApi } from '../api/Services';

// ChatScreen과 동일한 타입 정의 (로컬 저장 구조)
type LocalChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
};

// 백엔드 스크립트 구조
type ServerScriptMessage = {
  from: 'user' | 'ai';
  text: string;
};

// 화면에 표시할 포맷
type DisplayMessage = {
  id: string;
  role: 'user' | 'assistant';
  name: string;
  text: string;
};

export default function ScriptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const sessionId = route.params?.sessionId;

  const [scriptData, setScriptData] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("ScriptScreen sessionId:", sessionId);

  // ====== 1. 서버에서 스크립트 불러오기 ======
  const loadFromServer = async (sid: string) => {
    try {
      setLoading(true);
      const res: any = await conversationApi.getConversation(sid);
      // res: { success: true, data: { sessionId, script: [...] } }
      const script: ServerScriptMessage[] = res?.data?.data?.script ?? [];

      const formatted: DisplayMessage[] = script.map((msg, idx) => ({
        id: `${sid}-${idx}`,
        role: msg.from === 'user' ? 'user' : 'assistant',
        name: msg.from === 'user' ? 'Me' : 'Brainbox',
        text: msg.text,
      }));

      setScriptData(formatted);
    } catch (e) {
      console.log('loadFromServer error', e);
    } finally {
      setLoading(false);
    }
  };

  // ====== 2. 로컬 AsyncStorage에서 불러오기 (fallback) ======
  const loadFromLocal = async () => {
    try {
      setLoading(true);
      const jsonValue = await AsyncStorage.getItem('last_chat_history');

      if (jsonValue != null) {
        const parsedData: LocalChatMessage[] = JSON.parse(jsonValue);

        const formattedData: DisplayMessage[] = parsedData.map(msg => ({
          id: msg.id,
          role: msg.role === 'user' ? 'user' : 'assistant', // model -> assistant
          name: msg.role === 'user' ? 'Me' : 'Brainbox',
          text: msg.content,
        }));

        setScriptData(formattedData);
      } else {
        console.log('로컬에 저장된 대화가 없습니다.');
      }
    } catch (e) {
      console.error('로컬 데이터 불러오기 실패', e);
    } finally {
      setLoading(false);
    }
  };

  // ====== 3. 마운트 시 데이터 로드 ======
  useEffect(() => {
    if (sessionId) {
      // ChatHistory에서 들어온 경우 → 서버에서 해당 세션 스크립트 조회
      loadFromServer(sessionId);
    } else {
      // 예전처럼 마지막 대화 로컬 버전 보기
      loadFromLocal();
    }
  }, [sessionId]);

  const renderItem = ({ item }: { item: DisplayMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userContainer : styles.aiContainer,
        ]}
      >
        <Text style={styles.nameLabel}>{item.name}</Text>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // 로딩 화면
  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['left', 'right', 'bottom']}
      >
        <View
          style={[
            styles.root,
            { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color="#2C303C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.gradientBg} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>대화 스크립트</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* 데이터 없을 경우 */}
        {scriptData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>저장된 대화 내역이 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            data={scriptData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E5E7ED',
  },
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7ED',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
  },
  iconButton: {
    padding: 5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  nameLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 4,
    marginRight: 4,
  },
  bubble: {
    padding: 14,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#2C303C',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: '#000',
  },
  userText: {
    color: '#D5D8E0',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  closeButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#2C303C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});