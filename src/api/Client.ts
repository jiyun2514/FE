// src/api/Client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://lingomate-backend.ap-northeast-2.elasticbeanstalk.com';
console.log('🌐 [Client.ts] BASE_URL:', BASE_URL);
console.log('🌐 [Client.ts] BASE_URL json:', JSON.stringify(BASE_URL));

const ACCESS_TOKEN_KEY = 'accessToken';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryToken: string | null = null;

export const setAccessToken = async (token: string | null) => {
  inMemoryToken = token;

  if (token) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    delete client.defaults.headers.common.Authorization;
  }
};

export const hydrateAccessToken = async () => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  inMemoryToken = token;
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
};

client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};

    let token = inMemoryToken;

    if (!token) {
      token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      inMemoryToken = token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers.Authorization = undefined as any;
    }

    // 디버그 로그 
    // console.log('➡️ REQUEST', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    // console.log('➡️ Authorization', config.headers.Authorization);
    // console.log('➡️ Content-Type', (config.headers as any)['Content-Type']);
    // console.log('🌐 axios baseURL:', config.baseURL);
    console.log('🌐 axios url:', config.url);
    console.log('🌐 axios full:', (config.baseURL ?? '') + (config.url ?? ''));

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
