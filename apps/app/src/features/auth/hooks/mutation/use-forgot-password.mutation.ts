import type { APIError } from '@package/api-client';
import { useMutation } from '@package/query';
import { toast } from '@package/ui';
import { authApiService } from '../../services';
import type { ForgotPasswordMutation } from '../../types';

export function useForgotPasswordMutation() {
	return useMutation<
		ForgotPasswordMutation.ForgotPasswordMutationAxiosResponse,
		APIError,
		ForgotPasswordMutation.ForgotPasswordPayload
	>((variables) => authApiService.forgotPassword(variables), {
		onSuccess: (data) => {
			toast.success(data?.data?.message || 'Reset link sent successfully');
		},
		onError: (error) => {
			toast.error(error?.response?.data?.error || 'Failed to send reset link');
		},
	});
}
