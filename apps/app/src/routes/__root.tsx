import * as React from 'react'
import { Outlet,  createRootRouteWithContext,  } from '@tanstack/react-router'
import type { QueryClient } from '@package/tanstack-react-query'
import { CONFIG } from '@/config'
import { authApiService } from '@/features/auth/services/auth.services'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    await context.queryClient
      .fetchQuery({
        queryKey: CONFIG.QUERY_KEY.AUTH.ME,
        queryFn: () => authApiService.me().then(r => r.data),
        staleTime: 1000 * 60 * 5,
      })
      .catch(() => null);
  }
})

function RootComponent() {
  return (
    <React.Fragment>
        <Outlet />
    </React.Fragment>
  )
}
