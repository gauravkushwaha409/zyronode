import type { QueryClient } from "@package/query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import { authApiService } from "@/features/auth/services/auth.services";
import type { MeQuery } from "@/features/auth/types";

interface RouterContext {
	queryClient: QueryClient;
	user: {
		data: MeQuery.MeQueryAxiosResponse | null;
		error: MeQuery.MeQueryErrorResponse | null
	};
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,

	beforeLoad: async ({ context }) => {
		try {
			const currentUser = await context.queryClient
				.fetchQuery({
					queryKey: CONFIG.QUERY_KEY.AUTH.ME,
					queryFn: () => authApiService.me(),
					staleTime: 1000 * 60 * 5,
				})
				
			return {user: { data: currentUser, error: null }}
		} catch (error) {
			const err = error as MeQuery.MeQueryErrorResponse;
			return {user: { data: null, error: err }};
		}
	},
});

function RootComponent() {
	return <Outlet />;
}
