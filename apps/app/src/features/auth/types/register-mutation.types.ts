import type { ApiResponse } from "@package/api-client";

export interface RegisterMutationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterMutationData {
  user: User;
  tokens: Tokens;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Tokens {
  access: string;
  refresh: string;
}

export type RegisterMutationResponse = ApiResponse<RegisterMutationData>;
