import client from './Client';

// AI 서버 API 서비스
export const aiApi = {
  /**
   * 1. 채팅 메시지 전송
   * AI 서버가 히스토리를 관리하므로 text만 보내면 됨.
   */
  chat: (text: string, userId: string, difficulty = 'medium', register = 'casual') => 
    client.post('/api/ai/chat', { 
      text, 
      userId, 
      difficulty, 
      register 
    }),

  /**
   * 2. 문법 피드백 요청 (User 메시지용)
   */
  getFeedback: (text: string) => 
    client.post('/api/ai/feedback', { text }),

  /**
   * 3. 답변 추천 요청 (Assistant 메시지용)
   * AI 서버 명세: ai_text와 userId 필요
   */
  getExampleReply: (aiText: string, userId: string) => 
    client.post('/api/ai/example-reply', { 
      ai_text: aiText, 
      userId 
    }),

  /**
   * 4. 대화 세션 초기화 
   */
  resetConversation: (userId: string) => 
    client.post('/api/conversation/reset', { userId }),
  /**
   * 5. 대화 내역에서 회화 표현 추출
   */ 
  extractKeyPhrases: (history: any[]) => {
    // 대화 내역을 문자열로 변환
    const chatContext = history.map(m => `${m.role}: ${m.content}`).join('\n');
    
    // AI에게 요청할 프롬프트
    const prompt = `
      Analyze the following conversation and extract 5 useful English expressions for learning.
      Provide the Korean translation for each.
      
      Conversation:
      ${chatContext}

      Format: JSON Array
      [
        {"en": "English phrase", "kr": "Korean meaning"},
        ...
      ]
      Do not include any other text, only the JSON.
    `;

    // 기존 chat API 재활용 )
    // 여기서는 text로 프롬프트를 보내고 응답을 파싱하는 방식 사용
    return client.post('/api/ai/chat', { 
      text: prompt,
      userId: 'system_extractor' // 특수 목적용 ID
    });
  }
};
