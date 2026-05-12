import { useMutation } from "@package/tanstack-react-query";
import { authApiService } from "../../services";
import type { APIError, ApiResponse } from "@package/api-client";
import type { RegisterMutationPayload } from "../../types";


export function useRegisterMutation() {    
    return useMutation<ApiResponse<null>,APIError,RegisterMutationPayload>(
        (data)=> authApiService.register(data),
        {
            onSuccess: (data) => {
                console.log("on success ", data)
            },
            onError: (error) => {
                console.log("on error ", error)
            }
        }
    )
}