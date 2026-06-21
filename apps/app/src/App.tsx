import { TanstackQueryProvider } from "@package/query";
import { Toaster } from "@package/ui";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		queryClient,
		user: null,
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export function App() {
	return (
		<TanstackQueryProvider client={queryClient}>
			<Toaster />
			<RouterProvider router={router} />
		</TanstackQueryProvider>
	);
}
