// src/screens/WebSocketTestScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function WebSocketTestScreen() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState('연결 시도 전');
  const [lastMessage, setLastMessage] = useState<string>('');

  useEffect(() => {
    // 안드로이드 에뮬레이터 → 내 노트북 서버
    const ws = new WebSocket('ws://10.0.2.2:3000'); // ?token=... 안 붙여도 됨 (서버에서 test user로 fallback)

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WS 연결 성공');
      setStatus('✅ WebSocket 연결 성공');
    };

    ws.onmessage = (event) => {
      console.log('서버에서 온 메시지:', event.data);
      // 오디오 바이너리도 오기 때문에, 문자열만 화면에 표시
      if (typeof event.data === 'string') {
        setLastMessage(event.data);
      } else {
        setLastMessage('[binary data received]');
      }
    };

    ws.onerror = (event) => {
      console.log('WS 에러:', event);
      setStatus('❌ WebSocket 에러 발생 (log 확인)');
    };

    ws.onclose = () => {
      console.log('WS 연결 종료');
      setStatus('🔌 WebSocket 연결 종료');
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendTestMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('아직 WebSocket이 열려 있지 않음');
      return;
    }
    console.log('클라이언트 → 서버: Hello from RN!');
    wsRef.current.send('Hello from RN!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket 연결 테스트</Text>
      <Text style={styles.status}>{status}</Text>

      <Button title="메시지 보내기" onPress={sendTestMessage} />

      <Text style={styles.label}>서버에서 온 마지막 메시지:</Text>
      <Text style={styles.message}>{lastMessage || '(아직 없음)'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  status: { marginBottom: 16 },
  label: { marginTop: 24, fontWeight: '600' },
  message: { marginTop: 8, textAlign: 'center' },
});
