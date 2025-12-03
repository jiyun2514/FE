// src/api/services.ts

import { useAuthorizedClient } from './client';

/**
 * Hook return so you can use the authorized client inside screens
 * Example:
 *   const { aiApi } = useApi();
 *   await aiApi.chat(...)
 */
export const useApi = () => {
  const api = useAuthorizedClient();

  
  // AI CHAT API
  const aiApi = {
    /**
     * Send chat to backend AI
     */
    chat: (userId: string, message: string, mode: string = "casual") =>
      api.post("/api/ai/chat", {
        userId,
        message,
        mode,
      }),

    /**
     * Get grammar feedback for a message
     */
    getFeedback: (userId: string, message: string) =>
      api.post("/api/ai/feedback", {
        userId,
        message,
      }),

    /**
     * Get example replies based on AI's last message
     */
    getExampleReply: (userId: string, aiText: string) =>
      api.post("/api/ai/example-reply", {
        userId,
        ai_text: aiText,
      }),
  };

  //  Conversation Session API
  const conversationApi = {
    startSession: (userId: string) =>
      api.post("/api/conversation/start", { userId }),

    finishSession: (sessionId: string, script: any[]) =>
      api.post("/api/conversation/finish", {
        sessionId,
        script,
      }),

    resetConversation: (userId: string) =>
      api.post("/api/conversation/reset", { userId }),
  };

  return { aiApi, conversationApi };
};
