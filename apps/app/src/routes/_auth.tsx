import { CONFIG } from '@/config'
import { authApiService } from '@/features/auth/services/auth.services'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient
      .fetchQuery({
        queryKey: CONFIG.QUERY_KEY.AUTH.ME,
        queryFn: () => authApiService.me().then(r => r.data),
        staleTime: 1000 * 60 * 5,  
      })
      .catch(() => null);

    if (user) {
      throw redirect({
        to: `/$organization/dashboard`, params: {
          organization: "organization-id"
        }
      })
    }

  }
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <Outlet />
      </div>
    </div>
  )
}
