import { AuthGaurd } from '@/features/auth/gaurds'
import { createFileRoute, Outlet,  } from '@tanstack/react-router'
import { CONFIG } from '@/config'

export const Route = createFileRoute('/_organization-protected')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.queryClient.getQueryData(CONFIG.QUERY_KEY.AUTH.ME);

    if (!user) {

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
