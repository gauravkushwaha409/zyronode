import { AxiosError, AxiosResponse } from "axios";

export type ApiResponse<T> = AxiosResponse<{
    success: boolean;
    message?: string;
    data: T;
}>;

export type APIError = AxiosError<{
    success: boolean;
    message: string;
}>