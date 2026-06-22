import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailPage } from '@/pages/_verify/verify-email'

export const Route = createFileRoute('/_verify/verify-email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VerifyEmailPage />
}
