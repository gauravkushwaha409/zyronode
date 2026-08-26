import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@package/ui";

export const Route = createFileRoute("/_organization-protected/$organization/settings/motivation-celebration/manage-custom-quote")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader title="Manage Custom Quote" description="Create and manage custom motivation quotes." />
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="typo-t3 text-gray-500">Manage Custom Quote — design placeholder (backend to be wired later)</p>
      </div>
    </div>
  );
}
