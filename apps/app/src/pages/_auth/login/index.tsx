import { Link } from "@tanstack/react-router";
import { GoogleLogin, LoginMutation } from "@/features/auth/components";

export function LoginPage() {
	return (
		<div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
			<div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl sm:p-8 p-6 border border-gray-100 dark:border-zinc-800">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
						Welcome Back
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
						Sign in to your account to continue
					</p>
				</div>

				<LoginMutation />

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200 dark:border-zinc-700" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="bg-white dark:bg-zinc-900 px-2 text-gray-500 dark:text-gray-400">
							or continue with
						</span>
					</div>
				</div>

				<GoogleLogin />

				<div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-500 hover:underline"
					>
						Register
					</Link>
				</div>
			</div>
		</div>
	);
}
