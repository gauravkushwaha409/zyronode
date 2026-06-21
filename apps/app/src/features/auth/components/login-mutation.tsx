import { FormWrapper } from '@package/form';
import { toast } from '@package/ui';
import { useRouter } from '@tanstack/react-router';
import { useLoginForm, useLoginMutation } from '../hooks';
import { LoginForm } from './login-form';

export function LoginMutation() {
	const router = useRouter();
	const loginForm = useLoginForm();
	const loginMutation = useLoginMutation();

	const handleSubmit = loginForm.form.handleSubmit(
		(data) => {
			loginMutation.mutate(
				{
					email: data?.email,
					password: data?.password,
					captcha_token: data?.captcha_token,
				},
				{
					onSuccess: (data) => {
						toast.success(data?.data?.message || 'Login successful');

						if (data?.data?.data?.user?.lastOrgId) {
							router.navigate({
								to: '/$organization/dashboard',
								params: {
									organization: data?.data?.data?.user?.lastOrgId,
								},
							});
						} else if (data?.data?.data?.user?.id) {
							router.navigate({
								to: '/select-organization',
							});
						}
					},
					onError: (error) => {
						const fieldError = error?.response?.data?.errors;
						if (!fieldError) {
							toast.error(error?.response?.data?.error || 'An error occurred');
							return;
						}
					},
				},
			);
		},
		(error) => {
			toast.error(error?.captcha_token?.message || 'Please complete the captcha');
		},
	);

	return (
		<FormWrapper
			useFormMethods={loginForm.form}
			formProps={{ onSubmit: handleSubmit }}
		>
			<LoginForm
				setTurnstileToken={loginForm.setTurnstileToken}
				removeTurnstileToken={loginForm.removeTurnstileToken}
				isPending={loginMutation.isPending}
			/>
		</FormWrapper>
	);
}
