import { SelectOrganizationPage } from '@/pages/_organization-protected/select-organization'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_organization-protected/select-organization',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SelectOrganizationPage />
}
