import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/chatboq-settings/chatboq-behaviour")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader title="Chatboq Behaviour" description="Assignment rules and widget behaviour." />
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="typo-t3 text-gray-500">Chatboq Behaviour — design placeholder (backend to be wired later)</p>
      </div>
    </div>
  );
}
