import type { ApiResponse } from "@package/api-client";

export interface MeQueryData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: null;
  lastOrgId: null;
  createdAt: string;
  updatedAt: string;
}

export type MeQueryResponse = ApiResponse<MeQueryData>