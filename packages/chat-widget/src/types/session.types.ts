import type { APIError, ApiResponse } from "@package/api-client";

export interface CreateSessionPayload {
  organizationId: string;
  sourceUrl?: string;
  visitorName?: string;
  visitorEmail?: string;
  channel?: string;
}

export interface SessionData {
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

export type CreateSessionAxiosResponse = ApiResponse<SessionData>;
export type CreateSessionError = APIError;
