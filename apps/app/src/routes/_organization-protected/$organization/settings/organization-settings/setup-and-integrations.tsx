import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/organization-settings/setup-and-integrations")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader title="Setup & Integrations" description="Install widget snippet and verify domain." />
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="typo-t3 text-gray-500">Setup & Integrations — design placeholder (backend to be wired later)</p>
      </div>
    </div>
  );
}
