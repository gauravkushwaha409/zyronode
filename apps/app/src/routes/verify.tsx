import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authGaurds } from "@/features/auth/gaurds/auth.gaurd";

export const Route = createFileRoute("/verify")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const auth = context.auth;

		/**
		 *
		 */
		authGaurds.authentication(auth);
	},
});

function RouteComponent() {
	return <Outlet />;
}
