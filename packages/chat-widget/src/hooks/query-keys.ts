export const WIDGET_QUERY_KEYS = {
  SESSION: ["widget", "session"] as const,
  MESSAGES: (sessionId: string) =>
    ["widget", sessionId, "messages"] as const,
} as const;
