import { createFileRoute } from '@tanstack/react-router';
import { DefaultInboxPage } from '@/pages/_organization-protected/default-inbox';
import { defaultInboxSearchSchema } from '@/features/default-inbox/schemas';

export const Route = createFileRoute('/_organization-protected/$organization/inbox')({
  component: RouteComponent,
  validateSearch: defaultInboxSearchSchema,
});

function RouteComponent() {
  const { organization } = Route.useParams();
  return <DefaultInboxPage organizationId={organization} />;
}
