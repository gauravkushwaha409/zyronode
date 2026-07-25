import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
  InboxSessionsData,
  InboxSessionDetail,
  InboxSendAgentMessagePayload,
  InboxMessage,
} from "../types/inbox-api.types";

class InboxApiService extends BaseAPIService {
  async getSessions(
    organizationId: string,
    filters?: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.get<InboxSessionsData>(
      CONFIG.ENDPOINTS.INBOX.SESSIONS,
      {
        params: {
          organizationId,
          ...filters,
        },
        ...axiosConfiguration,
      },
    );
  }

  async getSessionDetail(
    sessionId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.get<InboxSessionDetail>(
      `${CONFIG.ENDPOINTS.INBOX.SESSION}/${sessionId}`,
      {
        params: { organizationId },
        ...axiosConfiguration,
      },
    );
  }

  async sendAgentMessage(
    sessionId: string,
    payload: InboxSendAgentMessagePayload,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<InboxMessage>(
      `${CONFIG.ENDPOINTS.INBOX.SEND_MESSAGE}/${sessionId}/messages`,
      payload,
      axiosConfiguration,
    );
  }

  async closeSession(
    sessionId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<{ id: string; status: string }>(
      `${CONFIG.ENDPOINTS.INBOX.SESSION}/${sessionId}/close`,
      { organizationId },
      axiosConfiguration,
    );
  }

  async reopenSession(
    sessionId: string,
    organizationId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<{ id: string; status: string }>(
      `${CONFIG.ENDPOINTS.INBOX.SESSION}/${sessionId}/reopen`,
      { organizationId },
      axiosConfiguration,
    );
  }

  async markAsRead(
    sessionId: string,
    axiosConfiguration?: AxiosRequestConfig,
  ) {
    return super.post<{ message: string }>(
      `${CONFIG.ENDPOINTS.INBOX.MARK_READ}/${sessionId}/messages/read`,
      undefined,
      axiosConfiguration,
    );
  }
}

export const inboxApiService = new InboxApiService(apiClient);
