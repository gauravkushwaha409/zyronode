import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/$organization/ticket')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/$organization/ticket"!</div>
}
