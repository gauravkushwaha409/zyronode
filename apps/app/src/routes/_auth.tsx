import { CONFIG } from '@/config'
import type { MeQuery } from '@/features/auth/types';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user: MeQuery.MeQueryResponse | undefined = context.queryClient.getQueryData(
      CONFIG.QUERY_KEY.AUTH.ME
    );
    console.log("User in before load: ", user)

    if (user?.data?.data?.lastOrgId) throw redirect({
      to: '/$organization/dashboard', params: {
        organization: user?.data?.data?.lastOrgId
      }
    })


    if (user?.data?.data?.id) throw redirect({
      to: '/select-organization'
    })
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
