import { RegisterMutation } from '@/features/auth/components/register-mutation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <RegisterMutation />
    </div>
  )
}
