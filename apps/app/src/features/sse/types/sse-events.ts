import type { ConnectionStatus } from "@package/sse";

export type { ConnectionStatus };

export interface SseMessage {
  id: string;
  sessionId: string;
  senderType: "VISITOR" | "AGENT" | "SYSTEM";
  senderId: string | null;
  messageType: "TEXT" | "FILE" | "INTERNAL_NOTE";
  content: string;
  replyToId: string | null;
  status?: "SENT" | "DELIVERED" | "READ";
  createdAt?: string;
}

export interface SseMessageCreatedEvent {
  session: { id: string };
  message: SseMessage;
}

/** Server -> client event names. Keep in sync with apps/server SSE publisher. */
export const SSE_EVENTS = {
  CONNECTED: "connected",
  MESSAGE_CREATED: "message.created",
} as const;
