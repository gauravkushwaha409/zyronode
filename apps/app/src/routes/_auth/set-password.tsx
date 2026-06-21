import { SetPasswordPage } from '@/pages/_auth/set-password'
import { createFileRoute } from '@tanstack/react-router'

interface SetPasswordSearch {
  token?: string
}

export const Route = createFileRoute('/_auth/set-password')({
  validateSearch: (search: Record<string, unknown>): SetPasswordSearch => ({
    token: search.token as string | undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <SetPasswordPage />
}
