import { createFileRoute } from "@tanstack/react-router";
import { LiveVisitorPage } from "@/pages/_organization-protected/$organization/visitor";

export const Route = createFileRoute(
	"/_organization-protected/$organization/visitor",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { organization } = Route.useParams();
	return <LiveVisitorPage organizationId={organization} />;
}
