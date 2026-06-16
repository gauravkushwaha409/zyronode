import { createFileRoute, redirect } from "@tanstack/react-router";
import { SelectOrganizationPage } from "@/pages/_organization-protected/select-organization";

export const Route = createFileRoute(
	"/_organization-protected/select-organization",
)({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		console.log(context.user);
		if (!context.user?.data?.data?.id) {
			throw redirect({ to: "/login" });
		}
	},
});

function RouteComponent() {
	return <SelectOrganizationPage />;
}
