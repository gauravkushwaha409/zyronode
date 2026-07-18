import { AxiosError, type AxiosResponse } from "axios";


export interface ServerResponse<T> {
    success: boolean;
    message: string;
    status_code: number;
    data: T;
}
export type ApiResponse<T> = AxiosResponse<ServerResponse<T>>;

export type APIError<TErrorCode extends string = string, TData = unknown> = AxiosError<{
    success: boolean;
    status_code: number;
    error: string;
    error_code: TErrorCode;
    errors?: TData;

}>