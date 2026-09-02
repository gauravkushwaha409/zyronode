import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/notifications-settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-6">
			<PageHeader title="Notifications Setting" description="Configure how and when you receive notifications." />
			<div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
				<p className="typo-t3 text-gray-500">Notifications Setting — design placeholder</p>
			</div>
		</div>
	);
}
