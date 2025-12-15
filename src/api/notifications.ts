// src/api/notifications.ts
import client from './Client';

export const notificationsApi = {
  // GET /api/notifications/settings
  getSettings: () => client.get('/api/notifications/settings'),

  // PUT /api/notifications/settings
  updateSettings: (enabled: boolean) =>
    client.put('/api/notifications/settings', { enabled }),
};
