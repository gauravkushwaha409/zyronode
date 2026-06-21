import type { ApiResponse } from '@package/api-client';

export interface SetPasswordPayload {
  new_password: string;
  token: string;
}

export interface SetPasswordData {
  success: boolean;
}

export type SetPasswordMutationAxiosResponse = ApiResponse<SetPasswordData>;
