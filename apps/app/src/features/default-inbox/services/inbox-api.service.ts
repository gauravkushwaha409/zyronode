import { type AxiosRequestConfig, BaseAPIService, type ApiResponse } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type { CursorPaginationParams } from "@/types/cursor-pagination.types";
import type {
  CreateConversationPayload,
  InboxConversationsData,
  InboxConversationDetail,
  InboxSendAgentMessagePayload,
  InboxMessage,
  InboxUploadedFile,
} from "../types/inbox-api.types";

export type InboxConversationsFilters = {
  status?: string;
  search?: string;
} & CursorPaginationParams;

class InboxApiService extends BaseAPIService {
  async getConversations(
    organizationId: string,
    filters?: InboxConversationsFilters,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.get<InboxConversationsData>(
      CONFIG.ENDPOINTS.INBOX.CONVERSATIONS,
      {
        params: {
          organizationId,
          ...filters,
        },
        ...axiosConfiguration,
      },
    );
  }

  async getConversationDetail(
    conversationId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.get<InboxConversationDetail>(
      `${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}`,
      {
        params: { organizationId },
        ...axiosConfiguration,
      },
    );
  }

  async createConversation(
    payload: CreateConversationPayload,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<
      { id: string },
      ApiResponse<{ id: string }>,
      CreateConversationPayload
    >(
      CONFIG.ENDPOINTS.INBOX.CREATE_CONVERSATION,
      payload,
      axiosConfiguration,
    );
  }

  async sendAgentMessage(
    conversationId: string,
    payload: InboxSendAgentMessagePayload,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<InboxMessage>(
      `${CONFIG.ENDPOINTS.INBOX.SEND_MESSAGE}/${conversationId}/messages`,
      payload,
      axiosConfiguration,
    );
  }

  async uploadFile(
    conversationId: string,
    organizationId: string,
    file: File,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("file", file);
    return super.post<InboxUploadedFile>(
      CONFIG.ENDPOINTS.INBOX.UPLOAD(conversationId),
      formData,
      {
        ...axiosConfiguration,
        // instance default is Content-Type: application/json — override to
        // undefined so axios/the browser sets multipart/form-data with the
        // correct boundary itself instead of sending FormData as JSON.
        headers: { ...axiosConfiguration?.headers, "Content-Type": undefined },
      },
    );
  }

  async closeConversation(
    conversationId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<{ id: string; status: string }>(
      `${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}/close`,
      { organizationId },
      axiosConfiguration,
    );
  }

  async reopenConversation(
    conversationId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<{ id: string; status: string }>(
      `${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}/reopen`,
      { organizationId },
      axiosConfiguration,
    );
  }

  async markAsRead(
    conversationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<{ message: string }>(
      `${CONFIG.ENDPOINTS.INBOX.MARK_READ}/${conversationId}/messages/read`,
      undefined,
      axiosConfiguration,
    );
  }

  async softDeleteConversation(
    conversationId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.delete<{ id: string }>(
      `${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}`,
      {
        params: { organizationId },
        ...axiosConfiguration,
      },
    );
  }

  async unreadStats(axiosConfiguration?: AxiosRequestConfig) {
    return super.get<{ conversations_with_unread: number; total_unread: number }>(
      CONFIG.ENDPOINTS.INBOX.UNREAD_STATS,
      axiosConfiguration,
    );
  }

  async getMessages(
    conversationId: string,
    filters?: CursorPaginationParams,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.get<{ messages: InboxMessage[]; pagination: import("@/types/cursor-pagination.types").CursorPaginationMeta }>(
      CONFIG.ENDPOINTS.INBOX.MESSAGES(conversationId),
      { params: { ...filters }, ...axiosConfiguration },
    );
  }
}

export const inboxApiService = new InboxApiService(apiClient);
