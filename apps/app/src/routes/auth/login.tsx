import { createFileRoute } from "@tanstack/react-router";
import { redirectAuthenticatedUserToApp } from "@/features/auth/gaurds";
import { LoginPage } from "@/pages/_auth/login";

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;
		if (!auth.isError && auth.user) {
			redirectAuthenticatedUserToApp(auth);
		}
	},
});

function RouteComponent() {
	return <LoginPage />;
}
