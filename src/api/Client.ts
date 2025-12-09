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
// const BASE_URL = "http://lingomate-backend.ap-northeast-2.elasticbeanstalk.com";
const BASE_URL = "http://10.0.2.2:8080"

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.defaults.headers.common['Authorization'] =
  "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InJGUVVqUW5SZS1ScTRIU1lkc3RFNSJ9.eyJpc3MiOiJodHRwczovL2Rldi1yYzVnc3lqazVwZnB0azcyLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJxVnFjcGdaM3RmY3p2S0c0ckhRbVJOTVhNYWRkODRkVUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hcGkubGluZ29tYXRlLmNvbSIsImlhdCI6MTc2NTI5NDA4NCwiZXhwIjoxNzY1MzgwNDg0LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJxVnFjcGdaM3RmY3p2S0c0ckhRbVJOTVhNYWRkODRkVSJ9.dJhUa0jFB-bi5DmYbNpIagnTFxyZZsQ78uLrYF2jqiY3-ka4lhcMtoRgVP0k_E__-61m8-7s6P7KkrytV5pE3mGFTj39p8fF1Xwq8o0MD2yEmOZVw8SrlY3i0rP_rL1XDq19DwKW1DSuqYvW9Vk_Oy2vqHKoe46HECRQ8MLE8sXeMbpIhO6w7nzODKlOIwINKyXAh9EvksMbLz5IQdxynruRv5BSMUj4ueSHtwehoj7SdKZGv9AT3WHuouANS8zhgwAbSkCKEAHsPwEjU4DwvUvhGnZZki3Dy45VVQ45mQXmrYADsV4bEQM5Z55u3HfxMm0Di5iW_sicgqLXtsM3dw";

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
