import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/chatboq-settings/chatboq-appearance")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader title="Chatboq Appearance" description="Widget colors, layout and welcome messages." />
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="typo-t3 text-gray-500">Chatboq Appearance — design placeholder (backend to be wired later)</p>
      </div>
    </div>
  );
}
