import { FormWrapper } from "@package/form";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { useLoginForm, useLoginMutation } from "../hooks";
import { LoginForm } from "./login-form";

export function LoginMutation() {
	const router = useRouter();
	const loginForm = useLoginForm();
	const loginMutation = useLoginMutation();

	const handleSubmit = loginForm.form.handleSubmit((data) => {
		loginMutation.mutate(
			{
				email: data?.email,
				password: data?.password,
				captcha_token: data?.captcha_token,
			},
			{
				onSuccess: async (response) => {
					toast.success(response?.data?.message || "Login successful");
					router.invalidate();
				},
				onError: (error) => {
					const fieldError = error?.response?.data?.errors;
					if (!fieldError) {
						toast.error(error?.response?.data?.error || "An error occurred");
					}
				},
			},
		);
	});

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
