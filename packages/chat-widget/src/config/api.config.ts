export const CHAT_WIDGET_API = {
  CONVERSATIONS: "/conversations",
  CONVERSATION_MESSAGES: (conversationId: string) =>
    `/conversations/${conversationId}/messages`,
  CONVERSATION_VISITOR_MESSAGES: (conversationId: string) =>
    `/conversations/${conversationId}/messages/visitor`,
} as const;
