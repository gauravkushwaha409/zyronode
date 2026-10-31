import { createFileRoute, redirect } from "@tanstack/react-router";
import { ADMIN_ROUTES } from "@/config";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: ADMIN_ROUTES.DASHBOARD });
	},
});
