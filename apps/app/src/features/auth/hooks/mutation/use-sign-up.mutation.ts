import type { APIError } from '@package/api-client';
import { useMutation } from '@package/query';
import { authApiService } from '../../services';
import type { SignUpMutation } from '../../types';

export function useSignUpMutation() {
	return useMutation<
		SignUpMutation.SignUpMutationAxiosResponse,
		APIError,
		SignUpMutation.SignUpMutationPayload
	>((data) => authApiService.signUp(data));
}
