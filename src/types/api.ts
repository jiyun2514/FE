// src/types/api.ts

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    code?: string;
    meta?: {
        requestId?: string;
        durationMs?: number;
        page?: number;
        limit?: number;
        total?: number;
    };
}

// === 1. Auth & Profile ===
export interface AuthMeResponse {
    auth0Id: string;
    userId: string;
    email: string;
    name: string;
    subscription: 'basic' | 'premium';
}

export interface UserProfile {
    userId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    subscription: 'basic' | 'premium';
    country: 'us' | 'uk' | 'aus';
    style: 'casual' | 'formal';
    gender: 'male' | 'female';
    streak: number;
}

export interface UpdateProfileRequest {
    name?: string;
    avatarUrl?: string | null;
    country?: 'us' | 'uk' | 'aus';
    style?: 'casual' | 'formal';
    gender?: 'male' | 'female';
}

// === 2. Conversation ===
export interface StartSessionResponse {
    sessionId: string;
    startTime: string;
}

export interface ChatMessage {
    from: 'user' | 'ai';
    text: string;
}

export interface FinishSessionRequest {
  sessionId: string;
  script: ChatMessage[];

  // ✅ 추가: 서버가 분 계산할 때 쓰게 (없어도 기존 동작 유지)
  durationMs?: number;
  startedAt?: string;  // ISO string
  finishedAt?: string; // ISO string
}

export interface FinishSessionResponse {
    sessionId: string;
    savedMessages: number;
}

// 서버가 보내주는 history item(원본)
export interface ConversationHistoryItemFromServer {
    sessionId: number;
    startTime: string;
    finishedAt: string | null;
    script: ChatMessage[];
  }
  
  // /api/conversation/history 응답 구조
  export interface ConversationHistoryResponse {
    userId: number;
    history: ConversationHistoryItemFromServer[];
  }

export interface ConversationHistoryItem {
    sessionId: string;
    title: string;
    messageCount: number;
    createdAt: string;
}

export interface ConversationDetail {
    sessionId: string;
    script: ChatMessage[];
}

// === 3. Subscription ===
export interface SubscriptionOption {
    callMinutes: number | string; // 10 or "∞"
    scriptLimit: number | string; // 3 or "∞"
    price: number;
}

export interface SubscriptionOptionsResponse {
    basic: SubscriptionOption;
    premium: SubscriptionOption;
}

export interface SubscribeResponse {
    plan: 'basic' | 'premium';
    startedAt: string;
}

export interface CancelSubscriptionResponse {
    canceledAt: string;
}

// === 4. AI ===
export interface AiChatResponse {
    text: string;
}

export interface AiFeedbackResponse {
    meaning: string;
    examples: string[];
}

export interface SttResponse {
    type: 'stt_result';
    text: string;
    confidence: number;
}

export interface TtsResponse {
    audio: string; // base64
    mime: string;
}

// === 5. Settings ===
export interface ConversationSettings {
    country: 'us' | 'uk' | 'aus';
    style: 'casual' | 'formal';
    gender: 'male' | 'female';
}

// === 6. Stats ===
export interface UserStats {
    totalSessions: number;
    totalMinutes: number;
    avgScore: number;
    bestScore: number;
    streak: number;
    newWordsLearned: number;
    progress: number[];
}

// === 7. Phrases ===
export interface Phrase {
    id: number;
    en: string;
    kr: string;
}

// === 8. Notifications ===
export interface NotificationSettings {
    enabled: boolean;
}

// === 9. Home ===
export interface HomeStatusResponse {
    todayConversationCount: number;          // 오늘 대화 횟수
    subscription: 'basic' | 'premium';       // 현재 구독 상태
}