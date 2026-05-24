import { LoginMutation } from "@/features/auth/components";
import { Link } from "@tanstack/react-router";

export function LoginPage() {
    return(
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl sm:p-8 p-6 border border-gray-100 dark:border-zinc-800">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Welcome Back</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sign in to your account to continue</p>
                </div>

                <LoginMutation />

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-500 hover:underline">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    )
}