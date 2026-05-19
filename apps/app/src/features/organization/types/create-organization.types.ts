import type { ApiResponse } from "@package/api-client";

export interface CreateOrganizationPayload {
  name: string;
  email: string;
  website?: string;
  phone?: string;
  industry?: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  website: string | null;
  phone: string | null;
  industry: string | null;
  plan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrganizationMutationResponse = ApiResponse<Organization>;