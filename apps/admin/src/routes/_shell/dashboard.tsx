import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/pages/admin-page";

export const Route = createFileRoute("/_shell/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<AdminPage
			title="Dashboard"
			description="Platform overview for the Zyronode admin console."
		/>
	);
}
