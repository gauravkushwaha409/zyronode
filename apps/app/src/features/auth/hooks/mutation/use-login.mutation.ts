import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { toast } from "@package/ui";
import { CONFIG } from "@/config";
import { authApiService } from "../../services";
import type { LoginMutation } from "../../types";

export function useLoginMutation() {
	return useMutation<
		LoginMutation.LoginMutationAxiosResponse,
		APIError,
		LoginMutation.LoginMutationPayload
	>((data) => authApiService.login(data), {
		invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME],
		onSuccess: (data) => {
			toast.success(data?.data?.message);
		},
		onError: (error) => {
			if (error?.response?.data?.error) {
				toast.error(error?.response?.data?.error);
			}
		},
	});
}
