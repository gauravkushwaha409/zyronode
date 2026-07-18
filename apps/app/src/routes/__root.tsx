import type { QueryClient } from "@package/query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import { authApiService } from "@/features/auth/services/auth.services";
import type { MeQuery } from "@/features/auth/types";
import type { ApiErrorCode } from "@/types";

export interface RouterContext {
	queryClient: QueryClient;
	auth: {
		user: MeQuery.MeQueryAxiosResponse | null;
		isPending: boolean;
		isError: boolean;
		error_code: ApiErrorCode | null;
		error: MeQuery.MeQueryErrorResponse | null;
	};
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,

		beforeLoad: async ({ context }) => {

		const { queryClient } = context;
		try {
			const currentUser = await context.queryClient.fetchQuery({
				queryKey: CONFIG.QUERY_KEY.AUTH.ME,
				queryFn: () => authApiService.me(),
				staleTime: 1000 * 60 * 5,
			});

			return {
				auth: {
					user: currentUser,
					isPending: false,
					isError: false,
					error_code: null,
					error: null,
				},
				queryClient,
			};
		} catch (error) {
			const err = error as MeQuery.MeQueryErrorResponse;
			return {
				auth: {
					user: null,
					isPending: false,
					isError: true,
					error_code: err?.response?.data?.error_code ?? "UNAUTHENTICATED",
					error: err,
				},
				queryClient,
			};
		}
	},
	loader: async ({ context }) => {
	}
});

function RootComponent() {
	return <Outlet />;
}
