// path: apps/frontend/src/routes/index.tsx

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      hello world
    </div>
  )
}
