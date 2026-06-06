import { useMutation } from "@package/tanstack-react-query";
import { authApiService } from "../../services";
import type { APIError, ApiResponse } from "@package/api-client";
import type { RegisterMutationTypes } from "../../types";
import { toast } from "@package/ui";

export function useRegisterMutation() {
  return useMutation<
    ApiResponse<null>,
    APIError,
    RegisterMutationTypes.RegisterMutationPayload
  >((data) => authApiService.register(data), {
    onSuccess: (data) => {
      toast.success(data?.data?.message)
      console.log("on success ", data);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong")
    },
  });
}
