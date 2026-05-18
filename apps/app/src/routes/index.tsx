// path: apps/frontend/src/routes/index.tsx

import { CONFIG } from '@/config'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authApiService } from '@/features/auth/services/auth.services'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient
      .fetchQuery({
        queryKey: CONFIG.QUERY_KEY.AUTH.ME,
        queryFn: () => authApiService.me().then(r => r.data),
        staleTime: 1000 * 60 * 5,  // don't refetch if fresh
      })
      .catch(() => null);  // 401 → null instead of throwing

    if (user) {
      throw redirect({
        to: '/$organization/dashboard', params: {
          organization: 'my-org'
        }
      })
    }

    throw redirect({ to: '/login' })
  }
})

function RouteComponent() {
  return null;
}
