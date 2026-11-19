import { createQueryClient } from "@package/query";

export const queryClient = createQueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0,
			gcTime: 0,
		},
		mutations: {
			retry: 0,
		},
	},
});
