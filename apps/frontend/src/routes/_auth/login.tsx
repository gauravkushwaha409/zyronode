import { RegisterForm } from '@package/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <RegisterForm />
  </div>
}
