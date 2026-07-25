export const CHAT_WIDGET_API = {
  SESSIONS: "/sessions",
  SESSION_MESSAGES: (sessionId: string) =>
    `/sessions/${sessionId}/messages`,
  SESSION_VISITOR_MESSAGES: (sessionId: string) =>
    `/sessions/${sessionId}/messages/visitor`,
} as const;
