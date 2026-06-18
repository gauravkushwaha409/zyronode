import { FormWrapper } from "@package/react-hook-form";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { useLoginForm, useLoginMutation } from "../hooks";
import { LoginForm } from "./login-form";

export function LoginMutation() {
	const router = useRouter();
	const loginForm = useLoginForm();
	const loginMutation = useLoginMutation();
	const { isPending } = loginMutation;

	const handleSubmit = loginForm.form.handleSubmit(
		(data) => {
			loginMutation.mutate(data, {
				onSuccess: (data) => {
					console.log("Login successful: ", data);
					toast.success(data?.data?.message || "Login successful");

					if (data?.data?.data?.user?.lastOrgId) {
						router.navigate({
							from: "/login",
							to: "/$organization/dashboard",
							params: {
								organization: data?.data?.data?.user?.lastOrgId,
							},
						});
					} else if (data?.data?.data?.user?.id) {
						router.navigate({
							from: "/login",
							to: "/select-organization",
						});
					}
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
			<LoginForm
				handleTurnstileSuccess={loginForm.handleTurnstileSuccess}
				isPending={isPending}
			/>
		</FormWrapper>
	);
}
