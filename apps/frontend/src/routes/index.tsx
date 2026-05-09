// path: apps/frontend/src/routes/index.tsx

import { TestComponent } from '@package/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <TestComponent />
  </div>
}
