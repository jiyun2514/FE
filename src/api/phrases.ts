// src/api/phrases.ts
import client from './Client';

export type PhraseItem = {
  id: number;
  en: string;
  kr: string;
};

export const phrasesApi = {
  // GET /api/phrases
  getPhrases: () => client.get<PhraseItem[]>('/api/phrases'),
};
