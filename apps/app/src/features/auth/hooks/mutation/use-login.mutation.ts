import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
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
	});
}
