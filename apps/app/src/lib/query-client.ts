import { createQueryClient } from "@package/query";

export const queryClient = createQueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 60 * 24, // 24 hours — must match maxAge
			retry: 0,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 0,
		},
	},
});
