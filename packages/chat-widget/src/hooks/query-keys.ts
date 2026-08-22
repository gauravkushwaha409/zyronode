export const WIDGET_QUERY_KEYS = {
  CONVERSATION: ["widget", "conversation"] as const,
  MESSAGES: (conversationId: string) =>
    ["widget", conversationId, "messages"] as const,
} as const;
