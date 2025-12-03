// src/api/client.ts

import axios from 'axios';
import { AuthContext } from '../../App';
import { useContext } from 'react';

// 🔥 Your deployed backend (Elastic Beanstalk)
const BASE_URL = "http://lingomate-eb.ap-northeast-2.elasticbeanstalk.com";

// Create axios instance
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== 🔥 AUTH INTERCEPTOR (Adds Bearer token automatically) =====
export const useAuthorizedClient = () => {
  const { accessToken } = useContext(AuthContext);

  const authorizedClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  return authorizedClient;
};

export default client;
