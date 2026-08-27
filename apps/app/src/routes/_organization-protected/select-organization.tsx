import { createFileRoute, redirect } from "@tanstack/react-router";
import { SelectOrganizationPage } from "@/pages/_organization-protected/select-organization";

export const Route = createFileRoute(
	"/_organization-protected/select-organization",
)({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;
		// auth.user is the axios response: .data (body) .data (envelope)
		if (auth.isError || !auth.user?.data?.data?.id) {
			throw redirect({ to: "/auth/login" });
		}
	},
});

function RouteComponent() {
	return <SelectOrganizationPage />;
}
