import type { ApiResponse } from "@package/api-client";

export interface LoginMutationPayload {
  email: string;
  password: string;
}

export interface LoginMutationData {
  user: User;
  tokens: Token;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Token {
  access: string;
  refresh: string;
}

export type LoginMutationResponse = ApiResponse<LoginMutationData>;
