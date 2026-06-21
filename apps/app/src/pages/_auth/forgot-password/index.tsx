import { FormHeader } from "@/features/auth/components";
import { useForgotPasswordForm, useForgotPasswordMutation } from "@/features/auth/hooks";
import { FormInput, FormWrapper } from "@package/form";
import { Button } from "@package/ui";
import { Link } from "@tanstack/react-router";

export function ForgotPasswordPage() {
	const forgotPasswordMutation = useForgotPasswordMutation();
	const forgotPasswordForm = useForgotPasswordForm();

	const handleForgotPasswordSubmit = forgotPasswordForm.form.handleSubmit(
		(data) => {
			forgotPasswordMutation.mutate(data);
		},
		() => {},
	);

	return (
		<div className="relative flex min-h-dvh items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="w-full max-w-md space-y-4">
				<FormHeader
					heading="Reset Your Password"
					description="Enter your registered email address and we'll send you a password reset link."
				/>
				<FormWrapper
					useFormMethods={forgotPasswordForm.form}
					formProps={{ onSubmit: handleForgotPasswordSubmit, className: "space-y-4" }}
				>
					<FormInput name="email" label="Email" placeholder="Enter your email" />
					<Button size="xl" className="w-full">
						Send Reset Link
					</Button>
				</FormWrapper>
				<div className="flex justify-center">
					<Link to="/login" className="w-fit underline text-blue-600 font-medium text-sm">
						Return to login
					</Link>
				</div>
			</div>
		</div>
	);
}
