import type { ApiResponse } from '@package/api-client';

export interface ResendEmailMutationResponseData {
  message: string;
}

export type ResendEmailMutationAxiosResponse = ApiResponse<ResendEmailMutationResponseData>;
