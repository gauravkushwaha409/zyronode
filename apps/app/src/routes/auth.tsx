import { AuthLayout } from "@package/ui";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { emailVerifyGuard, redirectAuthenticatedUserToApp } from "@/features/auth/gaurds";

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

		// Redirect authenticated users to app
		if (!auth.isError && auth.user) {
			redirectAuthenticatedUserToApp(auth);
		}

		// Email verification guard
		emailVerifyGuard(auth);

		// Onboarding guards
		if (auth.isError && auth.error_code === "USER_ONBOARDING_REQUIRED") {
			throw redirect({ to: "/onboarding/user" });
		}
		if (auth.isError && auth.error_code === "ORGANIZATION_ONBOARDING_REQUIRED") {
			throw redirect({ to: "/onboarding/organization" });
		}
	},
});

function RouteComponent() {
	return (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	);
}
