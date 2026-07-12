import { useMutation } from '@package/query';
import { authApiService } from '../../services';
import type { VerifyEmailMutation } from '../../types';

export function useVerifyEmailMutation() {
	return useMutation<
		VerifyEmailMutation.VerifyEmailMutationAxiosResponse,
		VerifyEmailMutation.VerifyEmailMutationError,
		VerifyEmailMutation.VerifyEmailMutationPayload
	>((data) => authApiService.verifyEmail(data));
}
