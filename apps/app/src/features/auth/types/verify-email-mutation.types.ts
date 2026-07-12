import type { APIError, ApiResponse } from '@package/api-client';

export interface VerifyEmailMutationPayload {
  email: string;
  code: string;
}

export interface VerifyEmailMutationData {
  message: string;
}

export type VerifyEmailMutationAxiosResponse = ApiResponse<VerifyEmailMutationData>;
export type VerifyEmailMutationError = APIError;
