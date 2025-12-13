// src/api/Client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://lingomate-backend.ap-northeast-2.elasticbeanstalk.com';

const ACCESS_TOKEN_KEY = 'accessToken';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let inMemoryToken: string | null = null;

export const setAccessToken = async (token: string | null) => {
  inMemoryToken = token;

  if (token) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const hydrateAccessToken = async () => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  inMemoryToken = token;
  return token;
};

// ✅ 요청 인터셉터: 매 요청마다 토큰 붙이기 (axios v1 타입: InternalAxiosRequestConfig)
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1) 메모리 토큰 우선
    let token = inMemoryToken;

    // 2) 없으면 AsyncStorage에서 가져오기
    if (!token) {
      token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      inMemoryToken = token;
    }

    // 3) 헤더 주입/제거
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // ✅ 디버그 로그
    console.log(
      '➡️ REQUEST',
      config.method?.toUpperCase(),
      `${config.baseURL}${config.url}`,
    );
    console.log('➡️ Authorization', config.headers.Authorization);

    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE', response.status, response.config?.url);
    return response;
  },
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.log('❌ API ERROR', status, url);

    if (error.response?.data) {
      console.log('❌ ERROR BODY', JSON.stringify(error.response.data, null, 2));
    }

    return Promise.reject(error);
  },
);

export default client;
