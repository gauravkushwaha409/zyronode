import { useMutation } from '@package/query';
import { authApiService } from '../../services';
import type { VerifyEmailMutation } from '../../types';

export function useVerifyEmailMutation() {
	return useMutation<
		VerifyEmailMutation.VerifyEmailMutationAxiosResponse,
		VerifyEmailMutation.VerifyEmailMutationError,
		VerifyEmailMutation.VerifyEmailMutationPayload
	>((data) => authApiService.verifyEmail(data), {
		onSuccess: (data) => {
			console.error('Email verified successfully', data);
		},
		onError: (error) => {
			console.error('Email verification failed', error);
		},
	});
}
