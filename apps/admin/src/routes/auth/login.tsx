import { Typography } from "@package/ui";
import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { ADMIN_ROUTES } from "@/config";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
import { adminAuthService } from "@/features/auth/services/admin-auth.service";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/auth/login")({
	beforeLoad: async () => {
		try {
			await queryClient.fetchQuery({
				queryKey: ADMIN_QUERY_KEY.AUTH.ME,
				queryFn: () => adminAuthService.me(),
				staleTime: 0,
			});
			throw redirect({ to: ADMIN_ROUTES.DASHBOARD });
		} catch (error) {
			if (isRedirect(error)) throw error;
		}
	},
	component: AdminLoginPage,
});

function AdminLoginPage() {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4">
			<div className="pointer-events-none absolute -top-40 -left-40 size-120 rounded-full bg-primary-100/60 blur-3xl" />
			<div className="pointer-events-none absolute -right-40 -bottom-40 size-120 rounded-full bg-primary-50 blur-3xl" />

			<section className="relative w-full max-w-115 rounded-[16px] border border-gray-border-50 bg-white-base p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
				<div className="mb-8 space-y-2 text-center">
					<div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-[12px] bg-linear-to-t from-primary-950 to-primary-500 text-lg font-bold text-white shadow-sm">
						Z
					</div>
					<Typography.H4 weight="bold" className="text-gray-950">
						Zyronode Admin
					</Typography.H4>
					<Typography.T3 className="text-gray-500">
						Sign in with your platform administrator account.
					</Typography.T3>
				</div>

				<AdminLoginForm />

				<Typography.T5 className="mt-6 block text-center text-gray-400">
					Platform administration is restricted to authorized staff.
				</Typography.T5>
			</section>
		</main>
	);
}
