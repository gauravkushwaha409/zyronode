import { useMutation } from '@package/query';
import { authApiService } from '../../services';
import type { ResendEmailMutation } from '../../types';

export function useResendEmailMutation() {
	return useMutation<
		ResendEmailMutation.ResendEmailMutationAxiosResponse,
		ResendEmailMutation.ResendEmailMutationError,
		ResendEmailMutation.ResendEmailMutationPayload
	>((data) => authApiService.resendEmail(data));
}
