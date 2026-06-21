import { Turnstile } from "@marsidev/react-turnstile";
import { FormInput, useFormContext } from "@package/form";
import { Button, Input, Label } from "@package/ui";
import { useState } from "react";
import type { LoginSchema } from "../schema";

function EyeIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<title>Show password</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			/>
		</svg>
	);
}

function EyeOffIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<title>Hide password</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
			/>
		</svg>
	);
}

function SpinnerIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<title>Loading</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
			/>
		</svg>
	);
}

function PasswordInput({
	isPending,
	showPassword,
	onToggle,
}: {
	isPending: boolean;
	showPassword: boolean;
	onToggle: () => void;
}) {
	const {
		register,
		formState: { errors },
	} = useFormContext<LoginSchema>();
	const error = errors.password?.message as string | undefined;

	return (
		<div className="space-y-3">
			<Label htmlFor="password">Password</Label>
			<div className="relative">
				<Input
					id="password"
					type={showPassword ? "text" : "password"}
					disabled={isPending}
					autoComplete="current-password"
					className="pr-10"
					{...register("password")}
				/>
				<button
					type="button"
					onClick={onToggle}
					className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					tabIndex={-1}
					aria-label={showPassword ? "Hide password" : "Show password"}
				>
					{showPassword ? (
						<EyeOffIcon className="size-4" />
					) : (
						<EyeIcon className="size-4" />
					)}
				</button>
			</div>
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}
		</div>
	);
}

export function LoginForm({
	handleTurnstileSuccess,
	isPending,
}: {
	handleTurnstileSuccess: (token: string) => void;
	isPending: boolean;
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="space-y-5">
			<FormInput
				name="email"
				label="Email"
				placeholder="you@example.com"
				inputProps={{ disabled: isPending, autoComplete: "email" }}
			/>

			<PasswordInput
				isPending={isPending}
				showPassword={showPassword}
				onToggle={() => setShowPassword((prev) => !prev)}
			/>

			<div className="flex justify-center">
				<Turnstile
					onSuccess={handleTurnstileSuccess}
					siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
					options={{ theme: "auto" }}
				/>
			</div>

			<Button
				type="submit"
				disabled={isPending}
				className="w-full h-11 text-base font-medium"
			>
				{isPending && <SpinnerIcon className="size-4 animate-spin" />}
				{isPending ? "Signing in..." : "Sign in"}
			</Button>
		</div>
	);
}
