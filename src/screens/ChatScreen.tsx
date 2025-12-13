// src/screens/ChatScreen.tsx
import PandaIcon from '../components/PandaIcon';
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useIsFocused,
  useFocusEffect,
} from '@react-navigation/native';
import { Send, Mic, Eye, Lightbulb, X } from 'lucide-react-native';
import { aiApi, conversationApi } from '../api/Services';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  Review: any;
};

// ===== 로컬 통계 키 =====
const STATS_KEYS = {
  totalMinutes: 'local_stats_totalMinutes',
  streak: 'local_stats_streak',
  lastStudyDate: 'local_stats_lastStudyDate', // "YYYY-MM-DD"
  totalSentences: 'local_stats_totalSentences',
  learnedSet: 'local_stats_learnedSentenceSet', // JSON string array
};

const ymdLocal = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isYesterday = (last: string, today: string) => {
  const [y, m, d] = last.split('-').map(Number);
  const lastDate = new Date(y, m - 1, d);
  const next = new Date(lastDate);
  next.setDate(lastDate.getDate() + 1);
  return ymdLocal(next) === today;
};

const normalizeSentence = (s: string) =>
  s.trim().replace(/\s+/g, ' ').toLowerCase();

// 🔍 피드백 문자열에서 [Corrected Sentence]: 부분만 뽑아내기
const extractCorrectedSentence = (feedback?: string | null): string | null => {
  if (!feedback) return null;
  const match = feedback.match(/\[Corrected Sentence\]:\s*(.+)/);
  if (!match) return null;
  return match[1].trim();
};

// 🔍 피드백 문자열에서 [Explanation]: 부분만 뽑아내기
const extractExplanation = (feedback?: string | null): string | null => {
  if (!feedback) return null;
  const match = feedback.match(/\[Explanation\]:\s*([\s\S]+)/);
  if (!match) return null;
  return match[1].trim();
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const TIMER_MS = 10 * 60 * 1000;

  const initialMode = route.params?.mode || 'casual';
  const [mode, setMode] = useState(initialMode);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! How are you today? Let's practice English!",
      suggestion: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  // ✅ 세션 시작 시각(로컬) + 서버 startTime 저장
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [serverStartTime, setServerStartTime] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // ⏱ 10분 제한 관련 상태
  const [timeUp, setTimeUp] = useState(false);
  const [remainingMs, setRemainingMs] = useState(TIMER_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ 종료 중복 방지
  const endedRef = useRef(false);

  // ✅ 점수 모달
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [latestScore, setLatestScore] = useState<number>(0);
  const [endWasAuto, setEndWasAuto] = useState(false);

  // ✅ 모달 확인 후 이동할 데이터
  const pendingNavRef = useRef<{ sessionId?: string; reviewCards: any[] } | null>(
    null,
  );

  // ✅ ChatScreen "들어갈 때마다" 타이머/플래그 리셋
  useFocusEffect(
    useCallback(() => {
      endedRef.current = false;

      setTimeUp(false);
      setRemainingMs(TIMER_MS);

      setScoreModalVisible(false);
      setLatestScore(0);
      setEndWasAuto(false);
      pendingNavRef.current = null;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, []),
  );

  // 1) 세션 시작 (mount 1회)
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await conversationApi.startSession();

        // ✅ successResponse 구조라면 보통: { success: true, data: {...} }
        if (res.data?.success && res.data?.data) {
          const sid = String((res.data.data as any).sessionId);
          setSessionId(sid);

          const st = (res.data.data as any).startTime
            ? String((res.data.data as any).startTime)
            : null;
          setServerStartTime(st);

          setSessionStartMs(Date.now());

          console.log('Session Started:', sid, 'startTime:', st);
        } else {
          console.log('startSession unexpected response:', res.data);
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        Alert.alert('Error', '대화 세션을 시작할 수 없습니다.');
      }
    };

    initSession();
  }, []);

  // 남은 시간 mm:ss 포맷
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ✅ 점수 모달 열기
  const openScoreModal = (opts: {
    score: number;
    isAuto: boolean;
    nav: { sessionId?: string; reviewCards: any[] };
  }) => {
    setLatestScore(opts.score ?? 0);
    setEndWasAuto(opts.isAuto);
    pendingNavRef.current = opts.nav;
    setScoreModalVisible(true);
  };

  // ✅ 모달 확인 누르면 Review로 이동
  const handleScoreConfirm = () => {
    const nav = pendingNavRef.current;
    setScoreModalVisible(false);

    if (!nav) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Review', {
      sessionId: nav.sessionId,
      reviewCards: nav.reviewCards,
    });
  };

  // ✅ 회화 종료(수동/자동)
  const handleEndChat = async (opts?: { auto?: boolean }) => {
    const isAuto = opts?.auto === true;

    // ✅ 중복 종료 방지
    if (endedRef.current) return;
    endedRef.current = true;

    console.log('🔥 handleEndChat', { isAuto });

    // ✅ 타이머 중지
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // ReviewCards 생성
    const reviewCards = messages
      .filter(m => m.role === 'user' && m.feedback)
      .map(m => {
        const corrected = extractCorrectedSentence(m.feedback);
        const explanation = extractExplanation(m.feedback);
        if (!corrected && !explanation) return null;
        return {
          corrected: corrected || m.content,
          explanation: explanation || '',
        };
      })
      .filter((c): c is { corrected: string; explanation: string } => c !== null);

    // ✅ (프론트만) 로컬 통계 업데이트 (네 기존 코드 유지)
    try {
      const durationMsLocal =
        sessionStartMs != null ? Math.max(0, Date.now() - sessionStartMs) : 0;
      const addMinutes = Math.max(1, Math.ceil(durationMsLocal / 60000)); // 최소 1분

      const prevMinutes = Number(
        (await AsyncStorage.getItem(STATS_KEYS.totalMinutes)) ?? '0',
      );
      await AsyncStorage.setItem(
        STATS_KEYS.totalMinutes,
        String(prevMinutes + addMinutes),
      );

      const todayKey = ymdLocal(new Date());
      const lastKey = await AsyncStorage.getItem(STATS_KEYS.lastStudyDate);
      const prevStreak = Number(
        (await AsyncStorage.getItem(STATS_KEYS.streak)) ?? '0',
      );

      let newStreak = prevStreak;
      if (!lastKey) newStreak = 1;
      else if (lastKey === todayKey) newStreak = prevStreak;
      else if (isYesterday(lastKey, todayKey)) newStreak = prevStreak + 1;
      else newStreak = 1;

      await AsyncStorage.setItem(STATS_KEYS.streak, String(newStreak));
      await AsyncStorage.setItem(STATS_KEYS.lastStudyDate, todayKey);

      const rawSet = (await AsyncStorage.getItem(STATS_KEYS.learnedSet)) ?? '[]';
      const arr: string[] = JSON.parse(rawSet);
      const learned = new Set(arr);

      const candidates = reviewCards.map(c => normalizeSentence(c.corrected));

      let added = 0;
      for (const s of candidates) {
        if (!s) continue;
        if (!learned.has(s)) {
          learned.add(s);
          added += 1;
        }
      }

      if (added > 0) {
        const prevSentences = Number(
          (await AsyncStorage.getItem(STATS_KEYS.totalSentences)) ?? '0',
        );
        await AsyncStorage.setItem(
          STATS_KEYS.totalSentences,
          String(prevSentences + added),
        );
        await AsyncStorage.setItem(
          STATS_KEYS.learnedSet,
          JSON.stringify(Array.from(learned)),
        );
      }

      console.log('✅ Local stats updated:', {
        addMinutes,
        streak: newStreak,
        addedSentences: added,
      });
    } catch (e) {
      console.log('❌ Local stats update failed:', e);
    }

    // sessionId 없으면 점수 없이 Review로 (원하면 여기서도 모달 띄워도 됨)
    if (!sessionId) {
      navigation.navigate('Review', { reviewCards });
      return;
    }

    const finishedAtIso = new Date().toISOString();
    const startedAtIso =
      serverStartTime ??
      (sessionStartMs ? new Date(sessionStartMs).toISOString() : null);
    const durationMs =
      sessionStartMs != null ? Math.max(0, Date.now() - sessionStartMs) : undefined;

    const payload = {
      sessionId,
      script: messages.map(m => ({
        from: m.role === 'user' ? 'user' : 'ai',
        text: m.content,
      })),
      durationMs,
      startedAt: startedAtIso ?? undefined,
      finishedAt: finishedAtIso,
    };

    try {
      console.log("🔥 conversationApi:", conversationApi);
      console.log("🔥 finishSession URL (try1):", (conversationApi as any)?.defaults?.baseURL);
      console.log("🔥 finishSession URL (try2):", (conversationApi as any)?.client?.defaults?.baseURL);

  // 2) finishSession 호출
      const res = await conversationApi.finishSession(payload as any);

  // 3) raw 응답 확인
      console.log('🔥 finishSession raw:', JSON.stringify(res.data, null, 2));

      const resBody = res.data as any;

  // 4) score 후보 여러 경로 커버
      const data = resBody?.data ?? resBody;

      const scoreCandidate =
      data?.scoreSaved ??           // ✅ 너 백엔드가 주는 키
      data?.score ??                // (혹시 다른 버전 대비)
      resBody?.scoreSaved ??
      resBody?.score ??
      data?.conversation?.score ??
      data?.result?.score;

      const score = Number.isFinite(Number(scoreCandidate)) ? Number(scoreCandidate) : 0;

      console.log("🔥 scoreCandidate:", scoreCandidate, "=> score:", score);

      // 저장 실패해도 모달은 띄우고 Review로 가게(점수 0)
      openScoreModal({
        score,
        isAuto,
        nav: { sessionId, reviewCards },
      });
    } catch (e) {
      console.error(e);
      openScoreModal({
        score: 0,
        isAuto,
        nav: { sessionId, reviewCards },
      });
    }
  };

  // ⏱ 2) 1초마다 남은 시간 줄이기 (포커스일 때만)
  useEffect(() => {
    if (!isFocused || timeUp) return;

    // 이미 interval 있으면 중복 방지
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          setTimeUp(true);

          // ✅ 시간 끝나면 자동 종료(저장+모달)
          if (isFocused) {
            handleEndChat({ auto: true });
          }

          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isFocused, timeUp]);

  // 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Feedback Request
  const handleRequestFeedback = async (messageId: string, content: string) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, isLoadingExtra: true } : msg)),
    );

    try {
      const res = await aiApi.getFeedback(content);

      if (res.data.success && res.data.data) {
        const data: any = res.data.data;
        let feedbackText = '';

        if (data.natural === false) {
          feedbackText =
            `[Corrected Sentence]: ${data.corrected_en}\n` +
            `[Explanation]: ${data.reason_ko}`;
        } else if (data.natural === true) {
          feedbackText = `${data.message}`;
        } else {
          throw new Error('Invalid feedback format');
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, feedback: feedbackText, isLoadingExtra: false }
              : msg,
          ),
        );
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (err) {
      Alert.alert('Error', '피드백을 불러오지 못했습니다.');
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? { ...msg, isLoadingExtra: false } : msg)),
      );
    }
  };

  // 답변 추천 (미구현)
  const handleRequestSuggestion = async () => {
    Alert.alert('Info', '답변 추천 기능은 준비 중입니다.');
  };

  const handleCloseExtra = (messageId: string, type: 'feedback' | 'suggestion') => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, [type]: null } : msg)));
  };

  const handleModeChange = () => {
    Alert.alert('회화 스타일 선택', '사용할 영어 스타일을 선택하세요.', [
      { text: '😊 Casual', onPress: () => setMode('casual') },
      { text: '🎓 Formal', onPress: () => setMode('formal') },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const handleFormSubmit = async () => {
    if (timeUp) {
      Alert.alert(
        '시간 종료',
        '10분이 지나서 더 이상 메시지를 보낼 수 없습니다.\n자동으로 종료되었어요.',
      );
      return;
    }

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
      const res = await aiApi.chat(input);
      if (res.data.success && res.data.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.data.text,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
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
        <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
          {!isUser && (
            <TouchableOpacity
              onPress={() =>
                item.suggestion ? handleCloseExtra(item.id, 'suggestion') : handleRequestSuggestion()
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

          <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
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
              <TouchableOpacity onPress={() => handleCloseExtra(item.id, 'feedback')}>
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
              <TouchableOpacity onPress={() => handleCloseExtra(item.id, 'suggestion')}>
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
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* ✅ 점수 모달 */}
        <Modal
          transparent
          visible={scoreModalVisible}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {endWasAuto ? '⏱ 회화 시간 종료' :'회화 종료'}
              </Text>
              <Text style={styles.modalScoreValue}>{latestScore}점</Text>

              <Pressable style={styles.modalBtn} onPress={handleScoreConfirm}>
                <Text style={styles.modalBtnText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => handleEndChat({ auto: false })} style={styles.iconButton}>
            <Text style={styles.endChatText}>회화 종료</Text>
          </TouchableOpacity>

          <View style={styles.headerMiddle}>
            <Text style={styles.headerTitle}>
              {mode === 'casual' ? 'Casual Mode' : 'Formal Mode'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleModeChange}>
            <Text style={styles.modeButtonText}>모드 변경</Text>
          </TouchableOpacity>
        </View>

        {/* 타이머 표시 */}
        <View style={{ alignItems: 'center', paddingVertical: 4 }}>
          <Text style={{ fontSize: 14, color: timeUp ? '#ef4444' : '#374151' }}>
            ⏱ 남은 시간: {formatTime(remainingMs)}
          </Text>
        </View>

        {/* 메시지 리스트 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingTop: 8 + insets.top }]}
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
                editable={!timeUp}
              />
              <TouchableOpacity style={styles.micButton}>
                <Mic color="#9ca3af" size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleFormSubmit}
              disabled={!input.trim() || isLoading || timeUp}
              style={[
                styles.sendButton,
                (!input.trim() || isLoading || timeUp) && styles.disabledButton,
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
  safeArea: { flex: 1, backgroundColor: '#e8eaf0' },
  container: { flex: 1, backgroundColor: '#e8eaf0' },

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
  headerMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2c303c' },
  endChatText: { fontSize: 12, color: '#2c303c', textDecorationLine: 'underline' },
  iconButton: { padding: 4 },
  modeButtonText: { fontSize: 12, color: '#2c303c', textDecorationLine: 'underline' },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
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

  messageRow: { marginBottom: 4, flexDirection: 'row', alignItems: 'flex-end' },
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
  feedbackTitle: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  feedbackText: { fontSize: 13, color: '#374151', lineHeight: 18 },

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
  suggestionTitle: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  suggestionText: { fontSize: 13, color: '#92400E', lineHeight: 18 },

  // ✅ 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  modalScoreText: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  modalScoreValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 18,
  },
  modalBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#2c303c',
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
