import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authGaurds } from "@/features/auth/gaurds/auth.gaurd";

export const Route = createFileRoute("/verify")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

		// Authentication guard
		authGaurds.authentication(auth);

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
	return <Outlet />;
}
