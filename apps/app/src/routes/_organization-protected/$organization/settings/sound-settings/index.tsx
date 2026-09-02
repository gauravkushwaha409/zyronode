import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/sound-settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-6">
			<PageHeader title="Sound Setting" description="Manage notification sounds and audio preferences." />
			<div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
				<p className="typo-t3 text-gray-500">Sound Setting — design placeholder (backend to be wired later)</p>
			</div>
		</div>
	);
}
