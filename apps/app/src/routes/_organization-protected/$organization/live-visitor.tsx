import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/live-visitor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Live Visitor" description="Live visitors on your site" />
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="typo-t3 text-gray-500">Live Visitor — coming soon</p>
      </div>
    </div>
  );
}
