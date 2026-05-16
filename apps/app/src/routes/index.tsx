// path: apps/frontend/src/routes/index.tsx

import { CONFIG } from '@/config'
import { authApiService } from '@/features/auth/services'
import { RootPage } from '@/pages'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await authApiService.me().catch(() => null)

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
