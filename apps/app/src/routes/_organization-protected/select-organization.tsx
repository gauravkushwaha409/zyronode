import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_organization-protected/select-organization',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_organization-protected/select-organization"!</div>
}
