import { FormHeader, Google, LoginMutation } from "@/features/auth/components";
import { Link } from "@tanstack/react-router";

export function LoginPage() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="w-full max-w-md space-y-4">
				<FormHeader
					heading="Welcome Back"
					description="Provide your email to access your account"
				/>
				<LoginMutation />
				<div className="space-y-4">
					<p className="text-center text-sm text-gray-400">Or</p>
					<Google />
				</div>
				<div className="flex justify-between">
					<p className="text-sm font-medium text-gray-800">
						Don't have an account?
					</p>
					<Link
						to="/register"
						className="text-sm font-semibold text-blue-600 underline"
					>
						Sign up
					</Link>
				</div>
			</div>
		</div>
	);
}
