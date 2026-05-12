import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_organization-protected/$orgId/inbox')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_organization-protected/$orgId/inbox"!</div>
}
