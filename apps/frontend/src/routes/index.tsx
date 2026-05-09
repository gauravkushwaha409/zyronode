// path: apps/frontend/src/routes/index.tsx

import { Button } from '@package/ui/components/ui/button'
import { TestComponent } from '@package/ui/test-component'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <TestComponent />
    <Button>Test Button</Button>
  </div>
}
