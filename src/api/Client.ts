// src/api/Client.ts

import axios from 'axios';
import { Platform } from 'react-native';

const PORT = '8080'; // 배포 서버 포트

// ✅ 배포된 백엔드 서버 URL 설정
const BASE_URL = `http://lingomate-eb.ap-northeast-2.elasticbeanstalk.com`;

// 로컬 개발 시 주석 해제하여 사용
/*
const LOCAL_PORT = '8000';
const BASE_URL = Platform.select({
  android: `http://10.0.2.2:${LOCAL_PORT}`, 
  ios: `http://localhost:${LOCAL_PORT}`,
});
*/

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAccessToken = (token: string | null) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

// 요청 로그 확인용 (디버깅)
client.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

client.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response.data, null, 2));
  return response;
});

export default client;