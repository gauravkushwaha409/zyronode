import { createFileRoute, redirect } from "@tanstack/react-router";
import { SelectOrganizationPage } from "@/pages/_organization-protected/select-organization";

export const Route = createFileRoute(
	"/_organization-protected/select-organization",
)({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;
		if (auth.isError || !auth.user?.data?.id) {
			throw redirect({ to: "/auth/login" });
		}
	},
});

function RouteComponent() {
	return <SelectOrganizationPage />;
}
