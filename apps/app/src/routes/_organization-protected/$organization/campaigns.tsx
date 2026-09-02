import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/campaigns")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Campaigns" description="Campaigns and broadcasts" />
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="typo-t3 text-gray-500">Campaigns — coming soon</p>
      </div>
    </div>
  );
}
