import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_organization-protected/$organization/visitor")({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/$organization/live-visitor",
			params: { organization: params.organization },
		});
	},
});
