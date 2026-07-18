import type { APIError, ApiResponse } from '@package/api-client';


export interface ResendEmailMutationResponseData {
  message: string;
}

export type ResendEmailMutationAxiosResponse = ApiResponse<ResendEmailMutationResponseData>;
export type ResendEmailMutationError = APIError;
