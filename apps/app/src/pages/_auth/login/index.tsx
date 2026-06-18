import { Link } from "@tanstack/react-router";
import { GoogleLogin, LoginMutation } from "@/features/auth/components";

function BackgroundOrbs() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<div className="absolute -top-24 -right-24 size-72 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-3xl" />
			<div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-cyan-400/5 dark:bg-cyan-500/5 blur-3xl" />
		</div>
	);
}

function ChatLogo() {
	return (
		<div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10">
			<svg
				className="size-7 text-white"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
			>
				<title>Chat</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
				/>
			</svg>
		</div>
	);
}

function Divider() {
	return (
		<div className="relative my-7">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-gray-200 dark:border-zinc-700/60" />
			</div>
			<div className="relative flex justify-center text-xs uppercase tracking-widest">
				<span className="bg-white dark:bg-zinc-900 px-3 text-gray-400 dark:text-zinc-500">
					Or continue with
				</span>
			</div>
		</div>
	);
}

export function LoginPage() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center p-4 overflow-hidden bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
			<BackgroundOrbs />

			<div
				className="relative w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 sm:p-10 p-7 border border-white/50 dark:border-zinc-800/50
				animate-in fade-in slide-in-from-bottom-3 duration-500"
			>
				<ChatLogo />

				<div className="text-center mb-8">
					<h1 className="text-[1.65rem] font-bold tracking-tight text-gray-900 dark:text-gray-100">
						Welcome back
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
						Sign in to your account to continue
					</p>
				</div>

				<LoginMutation />

				<Divider />

				<GoogleLogin />

				<div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline underline-offset-2 transition-colors"
					>
						Create one
					</Link>
				</div>
			</div>
		</div>
	);
}
