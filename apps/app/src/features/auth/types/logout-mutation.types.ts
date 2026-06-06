import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface LogoutMutationData{
    id: number;
    email: string;
    name: string;
}
export type LogoutMutationResponse = ServerResponse<LogoutMutationData>
export type LogoutMutationAxiosResponse = ApiResponse<LogoutMutationData>