import { FormHeader } from "@/features/auth/components";
import { useSetPasswordForm, useSetPasswordMutation } from "@/features/auth/hooks";
import { FormPassword, FormWrapper } from "@package/form";
import { Button } from "@package/ui";
import { useSearch } from "@tanstack/react-router";

export function SetPasswordPage() {
	const setPasswordForm = useSetPasswordForm();
	const setPasswordMutation = useSetPasswordMutation();
	const { token } = useSearch({ from: "/_auth/set-password" });

	if (!token) {
		return (
			<div className="relative flex min-h-dvh items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
				<p className="text-red-500">Invalid token</p>
			</div>
		);
	}

	const handleSetPasswordSubmit = setPasswordForm.form.handleSubmit(
		(data) => {
			setPasswordMutation.mutate(
				{ new_password: data.password, token: token as string },
			);
		},
		() => {},
	);

	return (
		<div className="relative flex min-h-dvh items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="w-full max-w-md space-y-4">
				<FormHeader
					heading="Set a New Password"
					description="Make sure you set a password you can easily recall next time."
				/>
				<FormWrapper
					useFormMethods={setPasswordForm.form}
					formProps={{ onSubmit: handleSetPasswordSubmit, className: "space-y-4" }}
				>
					<FormPassword
						name="password"
						label="New Password"
						placeholder="Enter new password"
					/>
					<FormPassword
						name="confirmPassword"
						label="Confirm Password"
						placeholder="Re-enter new password"
					/>
					<Button size="xl" className="w-full">
						Change Password
					</Button>
				</FormWrapper>
			</div>
		</div>
	);
}
