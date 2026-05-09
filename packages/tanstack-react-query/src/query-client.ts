// path: packages/tanstack-react-query/src/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,       // 5 minutes
        gcTime: 1000 * 60 * 60 * 24,    // 24 hours — must match maxAge
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })