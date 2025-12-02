// // src/screens/ChatScreen.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { ChevronLeft, Send, Mic, Eye, Lightbulb, X } from 'lucide-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import PandaIcon from '../components/PandaIcon';

// // ✅ 백엔드 API 서비스 임포트
// import { aiApi, conversationApi } from '../api/services';

// // 임시 유저 ID (추후 Auth0 연동 시 교체)
// const TEST_USER_ID = "test_user_123";

// // 타입 정의
// type Message = {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   feedback?: string | null;
//   suggestion?: string | null;
//   isLoadingExtra?: boolean;
// };

// type RootStackParamList = {
//   Home: undefined;
//   Chat: { mode?: string };
//   Review: undefined; // 리뷰 화면 타입 추가
// };

// export default function ChatScreen() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
//   const insets = useSafeAreaInsets();

//   const initialMode = route.params?.mode || 'casual';
//   const [register, setRegister] = useState(initialMode); // mode -> register (API 용어 통일)
//   const [sessionId, setSessionId] = useState<string | null>(null);

//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '0',
//       role: 'assistant',
//       content: "Hello! Let's start speaking English.",
//       suggestion: null,
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const flatListRef = useRef<FlatList>(null);

//   // 1️⃣ 초기화: AI 메모리 리셋 & 백엔드 세션 시작
//   useEffect(() => {
//     const initChat = async () => {
//       try {
//         // 1. AI 서버 메모리 리셋 (이전 대화 맥락 지우기)
//         await aiApi.resetConversation(TEST_USER_ID);
        
//         // 2. 백엔드 세션 시작 (세션 ID 발급)
//         const res = await conversationApi.startSession();
//         if (res.data.success) {
//           setSessionId(res.data.data.sessionId);
//           console.log("Session Started:", res.data.data.sessionId);
//         }
//       } catch (e) {
//         console.error("Failed to init chat", e);
//       }
//     };
//     initChat();
//   }, []);

//   // 스크롤 자동 이동
//   useEffect(() => {
//     if (messages.length > 0) {
//       setTimeout(
//         () => flatListRef.current?.scrollToEnd({ animated: true }),
//         100,
//       );
//     }
//   }, [messages]);

//   // ✅ [NEW] 대화 종료 및 저장 핸들러
//   const handleFinishConversation = async () => {
//     Alert.alert(
//       "대화 종료",
//       "대화를 종료하고 복습 화면으로 이동하시겠습니까?",
//       [
//         { text: "취소", style: "cancel" },
//         {
//           text: "종료",
//           style: "destructive",
//           onPress: async () => {
//             setIsLoading(true);
//             try {
//         
            //     // 1. AI에게 핵심 표현 추출 요청
            //     // (메시지 포맷을 AI가 이해하기 쉽게 변환)
            //   const historyPayload = messages.map(m => ({
            //     role: m.role === 'user' ? 'user' : 'model',
            //     content: m.content
            //   }));

            //   let reviewData = [];
            //   try {
            //     // 이 부분은 실제 백엔드 구현에 따라 달라질 수 있음
            //     // 예시: AI가 텍스트로 준 JSON을 파싱
            //     const res = await aiApi.extractKeyPhrases(historyPayload);
                
            //     // AI 응답 텍스트에서 JSON 부분만 추출하여 파싱 (간단 예시)
            //     const jsonText = res.data.data.text.replace(/```json|```/g, '').trim();
            //     reviewData = JSON.parse(jsonText);
                
            //   } catch (e) {
            //     console.error("추출 실패, 기본값 사용", e);
            //     // 실패 시 기본 메시지 혹은 빈 배열
            //     reviewData = [{ en: "Review data not available", kr: "데이터 없음" }];
            //   }

//               // 2. 백엔드 저장 (세션 종료)
//               if (sessionId && messages.length > 0) {
//                  const scriptPayload = messages.map(m => ({
//                   from: m.role === 'user' ? 'user' : 'ai',
//                   text: m.content
//                 }));
//                 await conversationApi.finishSession(sessionId, scriptPayload);
//                 console.log("Backend Session Finished");
//               }

//               // 3. Review 화면으로 이동 (Stack Replace로 뒤로가기 방지)
//               navigation.replace('Review'); 

//             } catch (error) {
//               console.error("Finish error", error);
//               Alert.alert("오류", "대화 저장 중 문제가 발생했습니다.");
//             } finally {
//               setIsLoading(false);
//             }
//           }
//         }
//       ]
//     );
//   };

//   // 2️⃣ 문법 피드백 요청 (API 연동)
//   const handleRequestFeedback = async (messageId: string, content: string) => {
//     setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isLoadingExtra: true } : msg));
//     try {
//       const res = await aiApi.getFeedback(content);
//       if (res.data.success) {
//         const data = res.data.data;
//         // API 응답 포맷팅
//         const feedbackText = data.natural 
//           ? `✅ ${data.message}` 
//           : `🔧 교정: ${data.corrected_en}\n\n📝 이유: ${data.reason_ko}`;
          
//         setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: feedbackText, isLoadingExtra: false } : msg));
//       }
//     } catch {
//       Alert.alert('Error', '피드백을 불러오지 못했습니다.');
//       setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isLoadingExtra: false } : msg));
//     }
//   };

//   // 3️⃣ 답변 추천 요청 (API 연동)
//   const handleRequestSuggestion = async (messageId: string, aiContent: string) => {
//     setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isLoadingExtra: true } : msg));
//     try {
//       const res = await aiApi.getExampleReply(aiContent, TEST_USER_ID);
//       if (res.data.success) {
//         setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, suggestion: res.data.data.reply_example, isLoadingExtra: false } : msg));
//       }
//     } catch {
//       Alert.alert('Error', '추천 답변을 불러오지 못했습니다.');
//       setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isLoadingExtra: false } : msg));
//     }
//   };

//   // 4️⃣ 메시지 전송 (API 연동)
//   const handleFormSubmit = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       // AI 서버 호출 (히스토리 관리X, 현재 텍스트만 전송)
//       const res = await aiApi.chat(input, TEST_USER_ID, 'medium', register);
      
//       if (res.data.success) {
//         const assistantMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: 'assistant',
//           content: res.data.data.text,
//         };
//         setMessages(prev => [...prev, assistantMessage]);
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'AI 응답 실패');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCloseExtra = (messageId: string, type: 'feedback' | 'suggestion') => {
//     setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, [type]: null } : msg));
//   };

//   const handleModeChange = () => {
//     Alert.alert('회화 스타일 선택', '사용할 영어 스타일을 선택하세요.', [
//       { text: '😊 Casual', onPress: () => setRegister('casual') },
//       { text: '🎩 Formal', onPress: () => setRegister('formal') },
//       { text: '취소', style: 'cancel' },
//     ]);
//   };

//   const renderItem = ({ item }: { item: Message }) => {
//     const isUser = item.role === 'user';
//     return (
//       <View style={{ marginBottom: 16 }}>
//         <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
//           {!isUser && (
//             <TouchableOpacity
//               onPress={() => item.suggestion ? handleCloseExtra(item.id, 'suggestion') : handleRequestSuggestion(item.id, item.content)}
//               style={styles.actionIconBtn}
//               disabled={item.isLoadingExtra}
//             >
//               {item.isLoadingExtra ? <ActivityIndicator size="small" color="#F59E0B" /> : <Lightbulb color="#F59E0B" size={20} fill={item.suggestion ? '#F59E0B' : 'none'} />}
//             </TouchableOpacity>
//           )}

//           <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
//             <Text style={styles.messageText}>{item.content}</Text>
//           </View>

//           {isUser && (
//             <TouchableOpacity
//               onPress={() => item.feedback ? handleCloseExtra(item.id, 'feedback') : handleRequestFeedback(item.id, item.content)}
//               style={styles.actionIconBtn}
//               disabled={item.isLoadingExtra}
//             >
//               {item.isLoadingExtra ? <ActivityIndicator size="small" color="#6B7280" /> : <Eye color="#6B7280" size={20} />}
//             </TouchableOpacity>
//           )}
//         </View>

//         {isUser && item.feedback && (
//           <View style={styles.feedbackContainer}>
//             <View style={styles.feedbackHeader}>
//               <Text style={styles.feedbackTitle}>🧐 피드백 (Grammar Check)</Text>
//               <TouchableOpacity onPress={() => handleCloseExtra(item.id, 'feedback')}><X size={16} color="#666" /></TouchableOpacity>
//             </View>
//             <Text style={styles.feedbackText}>{item.feedback}</Text>
//           </View>
//         )}

//         {!isUser && item.suggestion && (
//           <View style={styles.suggestionContainer}>
//             <View style={styles.feedbackHeader}>
//               <Text style={styles.suggestionTitle}>💡 이렇게 말할 수 있어요</Text>
//               <TouchableOpacity onPress={() => handleCloseExtra(item.id, 'suggestion')}><X size={16} color="#B45309" /></TouchableOpacity>
//             </View>
//             <Text style={styles.suggestionText}>{item.suggestion}</Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
//       <View style={styles.container}>
//         {/* 헤더 */}
//         <View style={[styles.header, { paddingTop: insets.top }]}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
//             <ChevronLeft color="#2c303c" size={24} />
//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>
//             {register === 'casual' ? '😊 Casual Mode' : '🎩 Formal Mode'}
//           </Text>

//           {/* 오른쪽 버튼 그룹 (모드 변경 + 종료) */}
//           <View style={styles.headerRightButtons}>
//             <TouchableOpacity onPress={handleModeChange} style={styles.modeButton}>
//               <Text style={styles.modeButtonText}>Mode</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={handleFinishConversation} style={styles.finishButton}>
//               <Text style={styles.finishButtonText}>종료</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* 메시지 리스트 */}
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={item => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={[styles.listContent, { paddingTop: 16 + insets.top }]}
//           ListHeaderComponent={
//             <View style={styles.mascotContainer}>
//               <View style={styles.mascotCircle}><PandaIcon size="medium" /></View>
//             </View>
//           }
//           ListFooterComponent={
//             isLoading ? (
//               <View style={styles.loadingContainer}>
//                 <View style={styles.assistantBubble}><ActivityIndicator color="#6b7280" size="small" /></View>
//               </View>
//             ) : null
//           }
//           showsVerticalScrollIndicator={false}
//         />

//         {/* 입력창 */}
//         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.input}
//                 value={input}
//                 onChangeText={setInput}
//                 placeholder="Hello, how are you today?"
//                 placeholderTextColor="#9ca3af"
//                 multiline={false}
//                 onSubmitEditing={handleFormSubmit}
//                 returnKeyType="send"
//               />
//               <TouchableOpacity style={styles.micButton}><Mic color="#9ca3af" size={20} /></TouchableOpacity>
//             </View>

//             <TouchableOpacity onPress={handleFormSubmit} disabled={!input.trim() || isLoading} style={[styles.sendButton, (!input.trim() || isLoading) && styles.disabledButton]}>
//               <Send color="#fff" size={18} />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#e8eaf0' },
//   container: { flex: 1, backgroundColor: '#e8eaf0' },
//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#d5d8e0',
//     borderBottomWidth: 1, borderBottomColor: '#c5c8d4',
//   },
//   headerTitle: { fontSize: 16, fontWeight: '600', color: '#2c303c' },
//   iconButton: { padding: 4 },
  
//   // ✅ 헤더 오른쪽 버튼 그룹 스타일
//   headerRightButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   modeButton: { padding: 4 },
//   modeButtonText: { fontSize: 14, color: '#2c303c', textDecorationLine: 'underline', fontWeight: '500' },
//   finishButton: {
//     paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#DC2626', borderRadius: 8,
//   },
//   finishButtonText: { fontSize: 13, color: '#ffffff', fontWeight: '600' },

//   listContent: { paddingHorizontal: 16, paddingBottom: 20 },
//   mascotContainer: { alignItems: 'center', marginVertical: 16 },
//   mascotCircle: {
//     width: 128, height: 128, backgroundColor: 'white', borderRadius: 64, borderWidth: 4,
//     borderColor: '#2c303c', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
//   },
//   messageRow: { marginBottom: 4, flexDirection: 'row', alignItems: 'flex-end' },
//   userRow: { justifyContent: 'flex-end' },
//   assistantRow: { justifyContent: 'flex-start' },
//   bubble: { maxWidth: '70%', padding: 12, borderRadius: 16 },
//   userBubble: { backgroundColor: '#b8bcc9', borderBottomRightRadius: 4 },
//   assistantBubble: { backgroundColor: '#d5d8e0', borderBottomLeftRadius: 4 },
//   messageText: { color: '#2c303c', fontSize: 14, lineHeight: 20 },
//   loadingContainer: { alignItems: 'flex-start', marginBottom: 10 },
//   inputContainer: {
//     flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#d5d8e0',
//     borderTopWidth: 1, borderTopColor: '#c5c8d4',
//   },
//   inputWrapper: {
//     flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
//     borderRadius: 24, paddingHorizontal: 16, height: 44, marginRight: 8,
//   },
//   input: { flex: 1, color: '#2c303c', fontSize: 14, padding: 0 },
//   micButton: { padding: 4 },
//   sendButton: {
//     width: 44, height: 44, borderRadius: 22, backgroundColor: '#2c303c',
//     justifyContent: 'center', alignItems: 'center',
//   },
//   disabledButton: { opacity: 0.5 },
//   actionIconBtn: { padding: 8, marginHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
//   feedbackContainer: { alignSelf: 'flex-end', backgroundColor: '#F3F4F6', width: '85%', padding: 12, borderRadius: 12, marginTop: 4, marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB' },
//   feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
//   feedbackTitle: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
//   feedbackText: { fontSize: 13, color: '#374151', lineHeight: 18 },
//   suggestionContainer: { alignSelf: 'flex-start', backgroundColor: '#FFFBEB', width: '85%', padding: 12, borderRadius: 12, marginTop: 4, marginLeft: 10, borderWidth: 1, borderColor: '#FCD34D' },
//   suggestionTitle: { fontSize: 12, fontWeight: '700', color: '#B45309' },
//   suggestionText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
// });