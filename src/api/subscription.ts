// src/api/subscription.ts
import client from './Client';

export const subscriptionApi = {
  // GET /api/subscription/options
  getOptions: () => client.get('/api/subscription/options'),

  // POST /api/subscription/subscribe
  subscribe: (plan: 'basic' | 'premium') =>
    client.post('/api/subscription/subscribe', { plan }),

  // POST /api/subscription/cancel
  cancel: () => client.post('/api/subscription/cancel'),
};
