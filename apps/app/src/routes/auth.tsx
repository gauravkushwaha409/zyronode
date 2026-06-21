import { AuthLayout } from "@package/ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import { redirectAuthenticatedUserToApp } from "@/features/auth/gaurds";
import type { MeQuery } from "@/features/auth/types";

export const Route = createFileRoute("/auth")({
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
	return (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	);
}
