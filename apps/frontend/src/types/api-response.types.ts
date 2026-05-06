import type { AxiosError } from 'axios';


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  redirect_url?: string;
  data?: T;
}


export type ApiError = AxiosError<{
  success: boolean;
  message: string;
}>;
