import { FormWrapper } from "@package/form";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import { queryClient } from "@/lib/query-client";
import { useLoginForm, useLoginMutation } from "../hooks";
import { authApiService } from "../services";
import { LoginForm } from "./login-form";

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
					onSuccess: async (response) => {
						toast.success(response?.data?.message || "Login successful");

						const meData = await queryClient.fetchQuery({
							queryKey: CONFIG.QUERY_KEY.AUTH.ME,
							queryFn: () => authApiService.me(),
						});

						if (!meData?.data?.data?.isEmailVerified) {
							router.navigate({ to: "/verify-email" });
							return;
						}

						if (response?.data?.data?.user?.lastOrgId) {
							router.navigate({
								to: "/$organization/dashboard",
								params: {
									organization: response?.data?.data?.user?.lastOrgId,
								},
							});
						} else if (response?.data?.data?.user?.id) {
							router.navigate({
								to: "/select-organization",
							});
						}
					},
					onError: (error) => {
						const fieldError = error?.response?.data?.errors;
						if (!fieldError) {
							toast.error(error?.response?.data?.error || "An error occurred");
						}
					},
				},
			);
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
