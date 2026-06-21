import type { ApiResponse } from '@package/api-client';

export interface SignUpMutationPayload {
  email: string;
  password: string;
  captcha_token: string;
}

export interface SignUpMutationResponseData {
  message: string;
}

export type SignUpMutationAxiosResponse = ApiResponse<SignUpMutationResponseData>;
