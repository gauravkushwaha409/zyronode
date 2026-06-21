import { Link } from "@tanstack/react-router";
import { FormHeader, Google, LoginMutation } from "@/features/auth/components";

export function LoginPage() {
	return (
		<section className="w-150 space-y-4 2xl:space-y-6">
			<FormHeader
				heading="Welcome Back"
				description="Provide your email to access your account"
			/>
			<LoginMutation />
			<div className="space-y-4 2xl:space-y-6">
				<p className="text-center text-sm text-gray-400">Or</p>
				<Google />
			</div>
			<div className="flex justify-between">
				<p className="text-sm font-medium text-gray-800">Don't have an account?</p>
				<Link
					to="/auth/register"
					className="text-sm font-semibold text-blue-600 underline"
				>
					Sign up
				</Link>
			</div>
		</section>
	);
}
