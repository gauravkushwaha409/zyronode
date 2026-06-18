import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import type { MeQuery } from "@/features/auth/types";

export const Route = createFileRoute("/_auth")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const user =
			context.queryClient.getQueryData<MeQuery.MeQueryAxiosResponse>(
				CONFIG.QUERY_KEY.AUTH.ME,
			);

		if (user?.data?.data?.lastOrgId)
			throw redirect({
				to: "/$organization/dashboard",
				params: {
					organization: user?.data?.data?.lastOrgId,
				},
			});

		if (user?.data?.data?.id)
			throw redirect({
				to: "/select-organization",
			});
	},
});

function RouteComponent() {
	return (
		<div className="min-h-dvh bg-gray-50 dark:bg-zinc-950">
			<Outlet />
		</div>
	);
}
