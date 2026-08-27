import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation } from "@package/query";
import { toast } from "@package/ui";
import { authApiService } from "../../services";
import type { RegisterMutationTypes } from "../../types";

export function useRegisterMutation() {
	return useMutation<
		ApiResponse<null>,
		APIError,
		RegisterMutationTypes.RegisterMutationPayload
	>((data) => authApiService.register(data), {
		onSuccess: (data) => {
			toast.success(data?.data?.message);
			console.log("on success ", data);
		},
		onError: (error) => {
			// the error envelope carries `error`, not `message`
			toast.error(error?.response?.data?.error || "Something went wrong");
		},
	});
}
