// path: apps/frontend/src/routes/index.tsx

import { Button } from '@package/ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <Button>Test Button</Button>
  </div>
}
