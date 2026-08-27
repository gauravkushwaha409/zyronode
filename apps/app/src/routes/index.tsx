import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

		// auth.user is the axios response, so the user payload sits at
		// .data (axios body) .data (CustomResponse envelope)
		const currentUser = auth.user?.data?.data;

		// If user is fully onboarded, redirect to app
		if (!auth.isError && currentUser?.id && currentUser.lastOrgId) {
			throw redirect({
				to: "/$organization/dashboard",
				params: {
					organization: currentUser.lastOrgId,
				},
			});
		}

		// If user exists but no org, redirect to select organization
		if (!auth.isError && currentUser?.id) {
			throw redirect({ to: "/select-organization" });
		}

		// Handle error codes
		if (auth.isError) {
			if (auth.error_code === "USER_ONBOARDING_REQUIRED") {
				throw redirect({ to: "/onboarding/user" });
			}
			if (auth.error_code === "ORGANIZATION_ONBOARDING_REQUIRED") {
				throw redirect({ to: "/onboarding/organization" });
			}
			if (auth.error_code === "EMAIL_UNVERIFIED") {
				throw redirect({ to: "/verify/email" });
			}
		}

		// Default: redirect to login
		throw redirect({ to: "/auth/login" });
	},
});

function RouteComponent() {
	return null;
}
