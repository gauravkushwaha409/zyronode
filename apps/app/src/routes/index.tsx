// path: apps/frontend/src/routes/index.tsx

import { CONFIG } from '@/config'
import { RootPage } from '@/pages'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.queryClient.getQueryData(CONFIG.QUERY_KEY.AUTH.ME)

    if (user) {
      throw redirect({
        to: '/$organization/dashboard', params: {
          organization: 'organization-id'
        }
      })
    }

    throw redirect({ to: CONFIG.ROUTES.AUTH.LOGIN })
  }
})

function RouteComponent() {
  return (
    <RootPage />
  )
}
