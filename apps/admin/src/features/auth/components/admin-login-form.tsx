import { Button, Input, Typography } from "@package/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { ADMIN_ROUTES } from "@/config";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { useAdminLoginMutation } from "@/features/auth/hooks/use-admin-auth";
import type { AdminAPIError } from "@/features/auth/types";

export function AdminLoginForm() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const loginMutation = useAdminLoginMutation();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		try {
			await loginMutation.mutateAsync({ email, password });
			await queryClient.invalidateQueries({
				queryKey: ADMIN_QUERY_KEY.AUTH.ME,
			});
			navigate({ to: ADMIN_ROUTES.DASHBOARD, replace: true });
		} catch (cause) {
			const apiError = cause as AdminAPIError;
			setError(
				apiError.response?.data?.error ??
					"Unable to sign in. Please try again.",
			);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="space-y-2">
				<Typography.T4 weight="medium" className="text-gray-700">
					Email
				</Typography.T4>
				<Input
					type="email"
					autoComplete="username"
					placeholder="admin@example.com"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
			</div>

			<div className="space-y-2">
				<Typography.T4 weight="medium" className="text-gray-700">
					Password
				</Typography.T4>
				<Input
					type="password"
					autoComplete="current-password"
					placeholder="Enter your password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					required
				/>
			</div>

			{error && (
				<p
					role="alert"
					className="rounded-[6px] border border-alert-100 bg-alert-25 px-3 py-2 text-sm text-alert-500"
				>
					{error}
				</p>
			)}

			<Button
				type="submit"
				size="xl"
				className="w-full"
				isPending={loginMutation.isPending}
				pendingText="Signing in..."
			>
				Sign in
			</Button>
		</form>
	);
}
