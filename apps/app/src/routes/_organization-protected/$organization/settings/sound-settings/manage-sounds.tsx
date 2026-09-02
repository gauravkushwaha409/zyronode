import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/sound-settings/manage-sounds")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-6">
			<PageHeader title="Manage Sounds" description="Upload and organize custom notification sounds." />
			<div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
				<p className="typo-t3 text-gray-500">Manage Sounds — design placeholder</p>
			</div>
		</div>
	);
}
