import { CONFIG } from '@/config'
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { MeQuery } from '@/features/auth/types';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user: MeQuery.MeQueryResponse | undefined = context.queryClient.getQueryData(
      CONFIG.QUERY_KEY.AUTH.ME
    );

    if (user?.data?.data?.lastOrgId) throw redirect({
      to: '/$organization/dashboard', params: {
        organization: user?.data?.data?.lastOrgId
      }
    })


    if (user?.data?.data?.id) throw redirect({
      to: '/select-organization'
    })

    throw redirect({ to: '/login' })
  }
})

function RouteComponent() {
  return null;
}
