import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthGaurd } from "@/features/auth/gaurds";

export const Route = createFileRoute("/_organization-protected")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

		// If no user at all, redirect to login
		if (
			auth.isError &&
			(auth.error_code === "UNAUTHENTICATED" ||
				auth.error_code === "SESSION_EXPIRED")
		) {
			throw redirect({ to: "/auth/login" });
		}

		// If email not verified, redirect to verify email
		if (auth.isError && auth.error_code === "EMAIL_UNVERIFIED") {
			throw redirect({ to: "/verify/email" });
		}

		// If user onboarding required, redirect to onboarding
		if (auth.isError && auth.error_code === "USER_ONBOARDING_REQUIRED") {
			throw redirect({ to: "/onboarding/user" });
		}

		// If organization onboarding required, redirect to org onboarding
		if (auth.isError && auth.error_code === "ORGANIZATION_ONBOARDING_REQUIRED") {
			throw redirect({ to: "/onboarding/organization" });
		}

		// auth.user is the axios response: .data (body) .data (envelope)
		const currentUser = auth.user?.data?.data;

		// If user has no org, redirect to select organization
		if (!auth.isError && currentUser?.id && !currentUser.lastOrgId) {
			throw redirect({ to: "/select-organization" });
		}
	},
});

function RouteComponent() {
	return (
		<AuthGaurd>
			<Outlet />
		</AuthGaurd>
	);
}
