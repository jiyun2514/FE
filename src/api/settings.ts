// src/api/settings.ts
import client from './Client';

export const settingsApi = {
  // GET /api/conversation/settings
  getSettings: () => client.get('/api/conversation/settings'),

  // PUT /api/conversation/settings
  updateSettings: (body: {
    country?: 'us' | 'uk' | 'aus';
    style?: 'casual' | 'formal';
    gender?: 'male' | 'female';
  }) => client.put('/api/conversation/settings', body),
};
