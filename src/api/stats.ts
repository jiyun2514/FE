// src/api/stats.ts
import client from './Client';
import { ApiResponse, UserStats } from '../types/api';

export const statsApi = {
  getStats: () => client.get<ApiResponse<UserStats>>('/api/stats'),
};

export default statsApi;
