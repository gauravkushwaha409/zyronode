import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TanstackQueryProvider, } from "@package/tanstack-react-query";

import { routeTree } from './routeTree.gen'
import { queryClient } from "./lib/query-client";
import { Toaster } from "@package/ui";


const router = createRouter({
  routeTree, context: {
    queryClient
  }
})


// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}




export function App() {
  return (
    <TanstackQueryProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={router} />
    </TanstackQueryProvider>
  )
}

