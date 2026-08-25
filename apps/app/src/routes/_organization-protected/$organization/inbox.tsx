import { createFileRoute } from "@tanstack/react-router";
import { defaultInboxSearchSchema } from "@/features/default-inbox/schemas";
import { DefaultInboxPage } from "@/pages/_organization-protected/default-inbox";

export const Route = createFileRoute(
	"/_organization-protected/$organization/inbox",
)({
	component: RouteComponent,
	validateSearch: defaultInboxSearchSchema,
});

function RouteComponent() {
	const { organization } = Route.useParams();
	return <DefaultInboxPage organizationId={organization} />;
}
