import { createFileRoute } from "@tanstack/react-router";
import { redirectAuthenticatedUserToApp } from "@/features/auth/gaurds";
import { LoginPage } from "@/pages/_auth/login";

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const currentUser = context.user;

		// if (!currentUser.error && currentUser.data) {
		// 	redirectAuthenticatedUserToApp(currentUser.data);
		// }
	},
});

function RouteComponent() {
	return <LoginPage />;
}
