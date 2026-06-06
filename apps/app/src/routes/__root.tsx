import * as React from 'react'
import { Outlet,  createRootRouteWithContext,  } from '@tanstack/react-router'
import type { QueryClient } from '@package/tanstack-react-query'
import { CONFIG } from '@/config'
import { authApiService } from '@/features/auth/services/auth.services'
import type { MeQuery } from '@/features/auth/types'

interface RouterContext {
  queryClient: QueryClient
  user: MeQuery.MeQueryResponse | null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient
      .fetchQuery({
        queryKey: CONFIG.QUERY_KEY.AUTH.ME,
        queryFn: () => authApiService.me(),
        staleTime: 1000 * 60 * 5,
      })
      .catch(() => null);
      
      context.user = user
  }
})

function RootComponent() {
  return (
    <React.Fragment>
        <Outlet />
    </React.Fragment>
  )
}
