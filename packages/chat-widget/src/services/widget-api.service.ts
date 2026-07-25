import { BaseAPIService } from "@package/api-client";
import { CHAT_WIDGET_API } from "../config";
import type {
  CreateSessionAxiosResponse,
  CreateSessionPayload,
  SessionData,
  GetMessagesAxiosResponse,
  MessagesData,
  SendMessageAxiosResponse,
  SendMessagePayload,
  ChatMessage,
} from "../types";
import { apiClient } from "./api-client";

export class WidgetApiService extends BaseAPIService {
  async createSession(payload: CreateSessionPayload) {
    return super.post<SessionData, CreateSessionAxiosResponse>(
      CHAT_WIDGET_API.SESSIONS,
      payload,
    );
  }

  async getMessages(sessionId: string, page = 1, limit = 50) {
    return super.get<MessagesData, GetMessagesAxiosResponse>(
      `${CHAT_WIDGET_API.SESSION_MESSAGES(sessionId)}?page=${page}&limit=${limit}`,
    );
  }

  async sendVisitorMessage(sessionId: string, payload: SendMessagePayload) {
    return super.post<ChatMessage, SendMessageAxiosResponse>(
      CHAT_WIDGET_API.SESSION_VISITOR_MESSAGES(sessionId),
      payload,
    );
  }
}

export const widgetApi = new WidgetApiService(apiClient as never);
