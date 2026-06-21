import type { APIError } from '@package/api-client';
import { useMutation } from '@package/query';
import { toast } from '@package/ui';
import { useNavigate } from '@tanstack/react-router';
import { authApiService } from '../../services';
import type { SetPasswordMutation } from '../../types';

export function useSetPasswordMutation() {
	const navigate = useNavigate();
	return useMutation<
		SetPasswordMutation.SetPasswordMutationAxiosResponse,
		APIError,
		SetPasswordMutation.SetPasswordPayload
	>((payload) => authApiService.setPassword(payload), {
		onSuccess: (data) => {
			toast.success(data?.data?.message || 'Password set successfully');
			navigate({ to: '/login' });
		},
		onError: (error) => {
			toast.error(error?.response?.data?.error || 'Failed to set password');
		},
	});
}
