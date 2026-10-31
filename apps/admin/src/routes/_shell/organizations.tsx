import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/pages/admin-page";

export const Route = createFileRoute("/_shell/organizations")({
	component: OrganizationsPage,
});

function OrganizationsPage() {
	return (
		<AdminPage
			title="Organizations"
			description="Manage every organization on the platform."
		/>
	);
}
