import { FormWrapper } from "@package/react-hook-form";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { useLoginForm, useLoginMutation } from "../hooks";
import { LoginForm } from "./login-form";

export function LoginMutation() {
	const router = useRouter();
	const loginForm = useLoginForm();
	const loginMutation = useLoginMutation();

	const handleSubmit = loginForm.form.handleSubmit(
		(data) => {
			loginMutation.mutate(data, {
				onSuccess: (data) => {
					if (data?.data?.data?.user?.lastOrgId) {
						router.navigate({
							from: "/login",
							to: "/$organization/dashboard",
							params: {
								organization: data?.data?.data?.user?.lastOrgId,
							},
						});
					}
					if (data?.data?.data?.user?.id) {
						router.navigate({
							from: "/login",
							to: "/select-organization",
						});
					}
					toast.success(data?.data?.message || "Login successful");
				},
				onError: (error) => {
					toast.error(error?.response?.data?.message || "An error occurred");
				},
			});
		},
		(error) => {
			console.log("On error: ", error);
		},
	);

	return (
		<FormWrapper
			useFormMethods={loginForm.form}
			formProps={{ onSubmit: handleSubmit }}
		>
			<LoginForm handleTurnstileSuccess={loginForm.handleTurnstileSuccess} />
		</FormWrapper>
	);
}
