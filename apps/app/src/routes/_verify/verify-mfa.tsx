import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_verify/verify-mfa')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_verify/verify-mfa"!</div>
}
