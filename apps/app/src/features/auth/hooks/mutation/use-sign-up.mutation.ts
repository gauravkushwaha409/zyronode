import type { APIError } from '@package/api-client';
import { useMutation } from '@package/query';
import { toast } from '@package/ui';
import { authApiService } from '../../services';
import type { SignUpMutation } from '../../types';

export function useSignUpMutation() {
	return useMutation<
		SignUpMutation.SignUpMutationAxiosResponse,
		APIError,
		SignUpMutation.SignUpMutationPayload
	>((data) => authApiService.signUp(data), {
		onSuccess: (data) => {
			toast.success(data?.data?.message);
		},
		onError: (error) => {
			toast.error(error?.response?.data?.error || 'Something went wrong');
		},
	});
}
