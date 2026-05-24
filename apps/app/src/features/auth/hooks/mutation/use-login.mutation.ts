import { useMutation } from "@package/tanstack-react-query";
import { authApiService } from "../../services";
import type { APIError } from "@package/api-client";
import type {  LoginMutationTypes, MeQuery,  } from "../../types";


export function useLoginMutation() {    
    return useMutation<MeQuery.MeQueryResponse,APIError,LoginMutationTypes.LoginMutationPayload>(
        (data)=> authApiService.login(data),
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