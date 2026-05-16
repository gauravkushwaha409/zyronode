import { authApiService } from '@/features/auth/services'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await authApiService.me().catch(() => null)

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
