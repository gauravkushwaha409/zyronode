import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/$organization/visitor")({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/$organization/live-visitor",
			params: { organization: params.organization },
		});
	},
});
