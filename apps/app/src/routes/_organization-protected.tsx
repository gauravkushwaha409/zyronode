import { AuthGaurd } from '@/features/auth/gaurds'
import { createFileRoute, Outlet, redirect,  } from '@tanstack/react-router'
import { CONFIG } from '@/config'
import { authApiService } from '@/features/auth/services/auth.services'

export const Route = createFileRoute('/_organization-protected')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient
      .fetchQuery({
        queryKey: CONFIG.QUERY_KEY.AUTH.ME,
        queryFn: () => authApiService.me().then(r => r.data),
        staleTime: 1000 * 60 * 5,  // don't refetch if fresh
      })
      .catch(() => null);  // 401 → null instead of throwing

    if (!user) {
      throw redirect({ to: CONFIG.ROUTES.AUTH.LOGIN })
    }
  },
})

function RouteComponent() {
  return(
    <AuthGaurd>
      <Outlet />
    </AuthGaurd>
  )
}
