import type { APIError, ApiResponse } from "@package/api-client";

export type MessageSenderType = "VISITOR" | "AGENT" | "SYSTEM";
export type MessageType = "TEXT" | "FILE" | "INTERNAL_NOTE";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string | null;
  messageType: MessageType;
  content: string;
  replyToId: string | null;
  replyTo: {
    id: string;
    content: string;
    senderType: MessageSenderType;
    senderId: string | null;
  } | null;
  status: "SENT" | "DELIVERED" | "READ";
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  content: string;
  messageType?: MessageType;
  replyToId?: string;
}

export interface MessagesData {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type GetMessagesAxiosResponse = ApiResponse<MessagesData>;
export type GetMessagesError = APIError;

export type SendMessageAxiosResponse = ApiResponse<ChatMessage>;
export type SendMessageError = APIError;
