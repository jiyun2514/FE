// src/api/user.ts
import client from './Client';

export const userApi = {
  // GET /api/user/profile
  getProfile: () => client.get('/api/user/profile'),

  // PUT /api/user/profile
  updateProfile: (body: {
    name?: string;
    avatarUrl?: string | null;
    country?: 'us' | 'uk' | 'aus';
    style?: 'casual' | 'formal';
    gender?: 'male' | 'female';
  }) => client.put('/api/user/profile', body),
};
