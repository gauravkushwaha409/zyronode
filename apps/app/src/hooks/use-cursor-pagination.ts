import type { ApiResponse } from "@package/api-client";
import { useInfiniteQuery } from "@package/query";
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import type {
  CursorDirection,
  CursorPageParam,
  CursorPaginationMeta,
} from "@/types/cursor-pagination.types";

/**
 * Generic cursor pagination hook — reusable across all cursor-paginated lists
 * (inbox, visitors, messages, etc.).
 *
 * Abstracts `useInfiniteQuery` with cursor + direction handling.
 * Backend must return `{ data: { pagination: CursorPaginationMeta, ...items } }`.
 *
 * @example
 * const { items, fetchNext, hasNext, isFetchingNext } = useCursorPagination<InboxConversationsData>({
 *   queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(orgId, { status, search }),
 *   fetchPage: ({ cursor, direction }) => inboxApiService.getConversations(orgId, { status, search, cursor, direction, limit: 20 }),
 *   getItems: (page) => page.data.conversations,
 *   enabled: !!orgId,
 * });
 */

type CursorPaginatedPage<TData> = ApiResponse<TData>;

interface UseCursorPaginationOptions<TData extends { pagination: CursorPaginationMeta }, TItem = unknown> {
  /** Stable queryKey excluding cursor/direction (e.g., orgId + filters). Changing it resets pagination. */
  queryKey: QueryKey;
  /** Fetch a single page given cursor+direction. Called with {cursor: null, direction: "next"} for first page. */
  fetchPage: (pageParam: CursorPageParam) => Promise<CursorPaginatedPage<TData>>;
  /** Extract items array from a page's data (e.g., page.conversations) */
  getItems: (page: TData) => TItem[];
  /** Extract pagination meta from a page's data */
  getPagination?: (page: TData) => CursorPaginationMeta;
  /** Items per page — forwarded to fetchPage via limit, also used for queryKey stability */
  limit?: number;
  /** Whether query is enabled (e.g., !!organizationId) */
  enabled?: boolean;
  /** Optional tanstack options passthrough */
  options?: Omit<
    UseInfiniteQueryOptions<
      CursorPaginatedPage<TData>,
      Error,
      InfiniteData<CursorPaginatedPage<TData>>,
      QueryKey,
      CursorPageParam
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "getPreviousPageParam"
  >;
}

export function useCursorPagination<
  TData extends { pagination: CursorPaginationMeta },
  TItem = unknown,
>({
  queryKey,
  fetchPage,
  getItems,
  getPagination,
  enabled = true,
  options,
}: UseCursorPaginationOptions<TData, TItem>) {
  const query = useInfiniteQuery<
    CursorPaginatedPage<TData>,
    Error,
    InfiniteData<CursorPaginatedPage<TData>>,
    QueryKey,
    CursorPageParam
  >({
    queryKey,
    queryFn: ({ pageParam }: { pageParam: CursorPageParam }) =>
      fetchPage(pageParam as CursorPageParam),
    initialPageParam: { cursor: null, direction: "next" as CursorDirection },
    getNextPageParam: (lastPage: CursorPaginatedPage<TData>) => {
      const data = lastPage.data.data as TData;
      const pagination = getPagination ? getPagination(data) : data.pagination;
      if (!pagination?.hasNext || !pagination.nextCursor) return undefined;
      return { cursor: pagination.nextCursor, direction: "next" as const };
    },
    getPreviousPageParam: (firstPage: CursorPaginatedPage<TData>) => {
      const data = firstPage.data.data as TData;
      const pagination = getPagination ? getPagination(data) : data.pagination;
      if (!pagination?.hasPrev || !pagination.prevCursor) return undefined;
      return { cursor: pagination.prevCursor, direction: "prev" as const };
    },
    enabled,
    ...options,
  });

  // Flatten all pages into single items array
  const pages = query.data?.pages ?? [];
  const items: TItem[] = pages.flatMap((page: CursorPaginatedPage<TData>) =>
    getItems(page.data.data as TData),
  );

  // Derive hasNext/hasPrev from last/first page's meta (handles bidirectional)
  const lastPage = pages[pages.length - 1];
  const firstPage = pages[0];
  const lastData = lastPage?.data?.data as TData | undefined;
  const firstData = firstPage?.data?.data as TData | undefined;
  const lastPagination = lastData
    ? getPagination
      ? getPagination(lastData)
      : lastData.pagination
    : null;
  const firstPagination = firstData
    ? getPagination
      ? getPagination(firstData)
      : firstData.pagination
    : null;

  return {
    ...query,
    /** Flattened items across all pages */
    items,
    /** Raw pages for advanced use */
    pages,
    /** Whether next page (older) exists */
    hasNextPage: !!lastPagination?.hasNext,
    /** Whether prev page (newer) exists */
    hasPreviousPage: !!firstPagination?.hasPrev,
    /** Next cursor value (for manual fetch) */
    nextCursor: lastPagination?.nextCursor ?? null,
    prevCursor: firstPagination?.prevCursor ?? null,
  };
}
