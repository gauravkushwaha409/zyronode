import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/pages/admin-page";

export const Route = createFileRoute("/_shell/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<AdminPage
			title="Settings"
			description="Configure platform-wide admin preferences."
		/>
	);
}
