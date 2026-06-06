import { AxiosError, type AxiosResponse } from "axios";


export interface ServerResponse<T> {
    success: boolean;
    message: string;
    statusCode: number;
    data: T;
}
export type ApiResponse<T> = AxiosResponse<ServerResponse<T>>;

export type APIError = AxiosError<{
    success: boolean;
    message: string;
}>