// types/tanstack-query.d.ts
import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: QueryMeta
    mutationMeta: MutationMeta
  }
}

export interface QueryMeta {
  persist?: boolean
  maxAge?: number        // override global 24h if needed
  tags?: string[]        // for grouped invalidation later
  errorMessage?: string  // custom toast message on error
  successMessage?: string
}

export interface MutationMeta {
  errorMessage?: string
  successMessage?: string
  invalidates?: string[] // queryKeys to invalidate on success
}