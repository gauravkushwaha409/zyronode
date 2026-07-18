import { AuthLayout } from "@package/ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { emailVerifyGuard, redirectAuthenticatedUserToApp } from "@/features/auth/gaurds";

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

		if (!auth.isError && auth.user) {
			redirectAuthenticatedUserToApp(auth);
		}

		/**
		 * Email Verification Gaurd
		 */
		emailVerifyGuard(auth);
	},
});

function RouteComponent() {
	return (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	);
}
