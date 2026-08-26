import { createQueryClient } from "@package/query";

export const queryClient = createQueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0, // 5 minutes
			gcTime: 0, // 24 hours — must match maxAge
		},
		mutations: {
			retry: 0,
		},
	},
});
