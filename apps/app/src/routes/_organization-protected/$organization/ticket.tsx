import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_organization-protected/$organization/ticket')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_organization-protected/$organization/ticket"!</div>
}
