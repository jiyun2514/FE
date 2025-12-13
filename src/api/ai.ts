// src/api/ai.ts
import { Platform } from 'react-native';
import client, { BASE_URL } from './Client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

// ✅ STT는 일단 하드코딩 유지 (네가 원한 방식)
const STT_URL =
  'http://lingomate-backend.ap-northeast-2.elasticbeanstalk.com/api/ai/stt';

export const aiApi = {
  // POST /api/ai/chat
  chat: (text: string) => client.post('/api/ai/chat', { text }),

  // POST /api/ai/feedback
  feedback: (text: string) => client.post('/api/ai/feedback', { text }),

  // POST /api/ai/tts
  tts: (
    text: string,
    accent: 'us' | 'uk' = 'us',
    gender: 'female' | 'male' = 'female',
  ) => client.post('/api/ai/tts', { text, accent, gender }),

  /**
   * ✅ STT PROBE (네트워크 레벨 확인용)
   * - status가 찍히면 "폰/망에서 서버까지는 닿음"
   * - 400/415/401이어도 네트워크는 OK일 수 있음
   */
  sttProbe: async () => {
    const url = STT_URL;

    console.log('🧪 STT PROBE url:', url);
    console.log('🧪 BASE_URL json:', JSON.stringify(BASE_URL));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ping: true }),
    });

    const text = await res.text();
    console.log('🧪 STT PROBE status:', res.status);
    console.log('🧪 STT PROBE body head:', text.slice(0, 200));
    return { status: res.status, body: text };
  },

  /**
   * ✅ STT (fetch 멀티파트)
   * - Content-Type 직접 넣지 말기(boundary 자동)
   * - field명은 'file'로 고정(대부분 multer.single('file'))
   */
  stt: async (file: any, sampleRate = 16000) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

    // ✅ 어떤 키로 와도 uri로 정규화
    const uri =
      file?.uri ??
      file?.uuri ??
      file?.[' uri'] ??
      file?.['uri '] ??
      file?.[' uuri'] ??
      null;

    const fixedFile: UploadFile = {
      uri: String(uri ?? ''),
      name: String(file?.name ?? 'stt_record.wav'),
      type: String(file?.type ?? 'audio/wav'),
    };

    console.log('🎙️ STT file keys:', Object.keys(file ?? {}));
    console.log('🎙️ STT fixedFile(before):', fixedFile);

    if (!fixedFile.uri) {
      throw new Error(`STT invalid uri: ${fixedFile.uri}`);
    }

    // ✅ Android는 file:// 없으면 붙여줌 (ChatScreen에서 붙여도 안전장치로 한 번 더)
    if (Platform.OS === 'android' && !fixedFile.uri.startsWith('file://')) {
      fixedFile.uri = `file://${fixedFile.uri}`;
    }

    console.log('🎙️ STT fixedFile(after):', fixedFile);

    const form = new FormData();
    // ✅ 핵심: field name을 file로
    form.append('file', fixedFile as any);
    form.append('sampleRate', String(sampleRate));

    console.log('🔥 STT fetch url:', STT_URL);

    const res = await fetch(STT_URL, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/json',
        // ⚠️ Content-Type 절대 넣지 마!
      },
      body: form,
    });

    const text = await res.text();
    console.log('✅ STT fetch status:', res.status);
    console.log('✅ STT body head:', text.slice(0, 200));

    if (!res.ok) {
      throw new Error(`STT ${res.status}: ${text}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      // 서버가 JSON이 아닌 텍스트를 준 경우 대비
      return { raw: text };
    }
  },
};
