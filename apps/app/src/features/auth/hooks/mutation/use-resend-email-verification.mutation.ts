import { useMutation } from '@package/query';
import { authApiService } from '../../services';
import type { ResendEmailMutation } from '../../types';

export function useResendEmailVerificationMutation() {
	return useMutation<
		ResendEmailMutation.ResendEmailMutationAxiosResponse,
		ResendEmailMutation.ResendEmailMutationError
	>(() => authApiService.resendEmail());
}
