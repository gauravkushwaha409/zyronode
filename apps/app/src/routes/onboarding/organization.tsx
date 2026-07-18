import { createFileRoute, redirect } from "@tanstack/react-router";
import { OrganizationOnboarding } from "@/features/onboarding/components";

export const Route = createFileRoute("/onboarding/organization")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

		// If user already has an organization, redirect to app
		if (auth.user?.data?.data?.lastOrgId) {
			throw redirect({
				to: "/$organization/dashboard",
				params: {
					organization: auth.user.data.data.lastOrgId,
				},
			});
		}

		// If error code is not ORGANIZATION_ONBOARDING_REQUIRED, redirect appropriately
		if (
			auth.isError &&
			auth.error_code !== "ORGANIZATION_ONBOARDING_REQUIRED"
		) {
			if (auth.error_code === "USER_ONBOARDING_REQUIRED") {
				throw redirect({ to: "/onboarding/user" });
			}
			if (auth.error_code === "EMAIL_UNVERIFIED") {
				throw redirect({ to: "/verify/email" });
			}
			throw redirect({ to: "/auth/login" });
		}
	},
});

function RouteComponent() {
	return <OrganizationOnboarding />;
}
