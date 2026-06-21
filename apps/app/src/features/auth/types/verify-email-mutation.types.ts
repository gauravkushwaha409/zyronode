import type { APIError, ApiResponse } from '@package/api-client';

export interface VerifyEmailMutationPayload {
  token: string;
}

export type VerifyEmailMutationData = null;
export type VerifyEmailMutationAxiosResponse = ApiResponse<VerifyEmailMutationData>;
export type VerifyEmailMutationError = APIError;
