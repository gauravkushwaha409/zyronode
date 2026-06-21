import type { ApiResponse } from '@package/api-client';

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponseData {
  message: string;
}

export type ForgotPasswordMutationAxiosResponse = ApiResponse<ForgotPasswordResponseData>;
