import * as React from 'react'
import { Outlet, createRootRoute, redirect } from '@tanstack/react-router'
import { TanstackQueryProvider } from '@package/tanstack-react-query'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <React.Fragment>
      <TanstackQueryProvider>

        <Outlet />
      </TanstackQueryProvider>
    </React.Fragment>
  )
}
