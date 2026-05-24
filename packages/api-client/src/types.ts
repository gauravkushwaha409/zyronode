import { AxiosError, type AxiosResponse } from "axios";

export type ApiResponse<T> = AxiosResponse<{
    success: boolean;
    message: string;
    statusCode: number;
    data: T;
}>;

export type APIError = AxiosError<{
    success: boolean;
    message: string;
}>