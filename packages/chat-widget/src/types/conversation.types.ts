import type { APIError, ApiResponse } from "@package/api-client";

export interface CreateConversationPayload {
  organizationId: string;
  sourceUrl?: string;
  visitorName?: string;
  visitorEmail?: string;
  channel?: string;
}

export interface ConversationData {
  id: string;
  organizationId: string;
  status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING";
  channel: string;
  visitorName: string | null;
  visitorEmail: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
  };
}

export type CreateConversationAxiosResponse = ApiResponse<ConversationData>;
export type CreateConversationError = APIError;
