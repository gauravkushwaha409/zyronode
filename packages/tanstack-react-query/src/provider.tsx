// packages/tanstack-react-query/src/provider.tsx
import { type ReactNode } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createQueryClient } from './query-client'
import { asyncStoragePersister } from './persister'

const queryClient = createQueryClient()

interface QueryProviderProps {
  children: ReactNode
}

export function TanstackQueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,    // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success', // only persist successful queries
        },
      }}
    >
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  )
}