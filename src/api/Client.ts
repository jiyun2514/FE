// src/api/Client.ts

import axios from 'axios';
import { Platform } from 'react-native';

// 로컬 백엔드 (server.js → 3000 포트)
/*
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
});
*/
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',  // ← 로컬 백엔드
  ios: 'http://localhost:3000',
});


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

client.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

client.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response.data, null, 2));
  return response;
});

export default client;
