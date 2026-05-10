import { RegisterForm } from '@package/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <RegisterForm />
    </div>
  )
}
