import { createFileRoute } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import { redirectAuthenticatedUserToApp } from "@/features/auth/gaurds";
import type { MeQuery } from "@/features/auth/types";
import { LoginPage } from "@/pages/_auth/login";

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const user =
			context.queryClient.getQueryData<MeQuery.MeQueryAxiosResponse>(
				CONFIG.QUERY_KEY.AUTH.ME,
			);

		redirectAuthenticatedUserToApp(user);
	},
});

function RouteComponent() {
	return <LoginPage />;
}
