// packages/query/src/provider.tsx
import { type ReactNode } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { asyncStoragePersister } from './persister'
import type { QueryClient } from '@tanstack/react-query'

interface QueryProviderProps {
  children: ReactNode
  client: QueryClient
}

export function TanstackQueryProvider({ children, client }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,    // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>{
           return query.meta?.persist === true
          }
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