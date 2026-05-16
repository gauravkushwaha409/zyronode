import { AuthGaurd } from '@/features/auth/gaurds'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_organization-protected')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <AuthGaurd>
      <Outlet />
    </AuthGaurd>
  )
}
