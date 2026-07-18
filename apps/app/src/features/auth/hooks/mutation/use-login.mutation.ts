import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { authApiService } from "../../services";
import type { LoginMutation } from "../../types";

export function useLoginMutation() {
	return useMutation<
		LoginMutation.LoginMutationAxiosResponse,
		APIError,
		LoginMutation.LoginMutationPayload
	>((data) => authApiService.login(data),);
}
