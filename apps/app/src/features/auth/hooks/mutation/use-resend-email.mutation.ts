import type { APIError } from '@package/api-client';
import { useMutation } from '@package/query';
import { authApiService } from '../../services';
import type { ResendEmailMutation } from '../../types';

export function useResendEmailMutation() {
	return useMutation<
		ResendEmailMutation.ResendEmailMutationAxiosResponse,
		APIError
	>(() => authApiService.resendEmail(), {
		onSuccess: () => {},
		onError: (error) => {
			console.error('Resend email failed', error);
		},
	});
}
