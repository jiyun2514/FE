// src/api/ai.ts
import client, { BASE_URL } from './Client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

// STT만 로컬 터널을 쓰고 싶을 때 설정. 비우면 BASE_URL 사용.
// 예) 테스트 시 'https://slick-birds-dress.loca.lt'
// const STT_BASE_URL = 'https://slick-birds-dress.loca.lt';

const ACCESS_TOKEN_KEY = 'accessToken';
export const aiApi = {
  /**
   * ✅ STT — multipart/form-data, field name "audio"
   *    - WAV/MP3: 서버가 ffmpeg로 변환
   *    - .pcm: 변환 스킵
   * fetch 사용 (RN axios 업로드 이슈 우회)
   */
  stt: async (wavFilePath: string) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

    // Android는 file:// 스킴 필요
    const uri =
      Platform.OS === 'android'
        ? wavFilePath.startsWith('file://')
          ? wavFilePath
          : `file://${wavFilePath}`
        : wavFilePath;

    const targetBase = BASE_URL;
    //const targetBase = STT_BASE_URL;

    // 기본: 멀티파트 업로드 (EB)
    const form = new FormData();
    form.append('audio', {
      uri,
      name: 'audio.wav',
      type: 'audio/wav',
    } as any);

    console.log('[STT] fetch upload', {
      uri,
      hasToken: !!token,
      baseUrl: targetBase,
    });

    try {
      const res = await fetch(`${targetBase}/api/ai/stt`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
          // Content-Type 지정 금지 (boundary 자동)
        },
        body: form as any,
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(`STT ${res.status}: ${text || 'Network/Server error'}`);
      }
      try {
        const json = JSON.parse(text);
        return json?.data ?? json;
      } catch {
        return { raw: text };
      }
    } catch (e: any) {
      console.log('[STT] multipart failed, fallback to base64', e?.message || e);

      // Fallback: base64 JSON 전송
      const cleanPath = uri.replace(/^file:\/\//, '');
      const audioBase64 = await RNFS.readFile(cleanPath, 'base64');
      console.log('[STT] base64 upload fallback', {
        path: cleanPath,
        baseUrl: targetBase,
        hasToken: !!token,
        base64Len: audioBase64.length,
      });

      const res2 = await fetch(`${targetBase}/api/ai/stt`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          fileName: 'audio.wav',
        }),
      });

      const text2 = await res2.text();
      if (!res2.ok) {
        throw new Error(`STT fallback ${res2.status}: ${text2 || 'Network/Server error'}`);
      }
      try {
        const json2 = JSON.parse(text2);
        return json2?.data ?? json2;
      } catch {
        return { raw: text2 };
      }
    }
  },

  chat: (text: string) => client.post('/api/ai/chat', { text }),
  feedback: (text: string) => client.post('/api/ai/feedback', { text }),
  // ai_text + optional sessionId 로 예시 답변 생성
  exampleReply: (aiText: string, sessionId?: string | null) =>
    client.post('/api/ai/example-reply', {
      ai_text: aiText,
      sessionId: sessionId ?? undefined,
    }),
  tts: (text: string, accent: string = 'us', gender: string = 'female') =>
    client.post('/api/ai/tts', { text, accent, gender }),
};