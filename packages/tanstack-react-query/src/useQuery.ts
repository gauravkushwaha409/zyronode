
import {
  type DefaultError,
  type QueryKey,
  type UseQueryOptions,
  useQuery as useTanstackQuery,
} from '@tanstack/react-query';

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TParams = unknown,
>(
  queryKey: QueryKey,
  fetchFn: (params?: TParams) => Promise<TQueryFnData>,
  params?: TParams,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useTanstackQuery<TQueryFnData, TError, TData, QueryKey>({
    queryKey: queryKey,
    queryFn: async () => {
      return fetchFn(params);
    },

    retry: 1,
    staleTime: 1000 * 60 * 5,
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 5 * 2 ** attemptIndex + 1, 60 * 1000);
      return delay;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
    meta: {
      maxAge: 10,
    },
  });
}
