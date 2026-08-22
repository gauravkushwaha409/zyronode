import type { APIError, ApiResponse } from "@package/api-client";

export type { ConversationData } from "./conversation.types";
export type {
  CreateConversationPayload,
  CreateConversationAxiosResponse,
  CreateConversationError,
} from "./conversation.types";
export type {
  ChatMessage,
  MessageSenderType,
  MessageType,
  SendMessagePayload,
  MessagesData,
  GetMessagesAxiosResponse,
  GetMessagesError,
  SendMessageAxiosResponse,
  SendMessageError,
} from "./message.types";
