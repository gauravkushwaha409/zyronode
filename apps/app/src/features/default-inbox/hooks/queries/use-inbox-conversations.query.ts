import type { ApiResponse } from "@package/api-client";
import { CONFIG } from "@/config";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import type { CursorPaginationParams } from "@/types/cursor-pagination.types";
import { inboxApiService } from "../../services/inbox-api.service";
import type { InboxConversationListItem, InboxConversationsData } from "../../types/inbox-api.types";

/**
 * Cursor-paginated inbox conversations — uses reusable `useCursorPagination`.
 * Replaces offset `page` pagination (removed in backend). Supports bidirectional
 * infinite scroll: `fetchNextPage` = older (next), `fetchPreviousPage` = newer (prev).
 *
 * @example
 * const { items, fetchNextPage, hasNextPage } = useInboxConversationsQuery(orgId, { status, search, limit: 20 })
 */
export function useInboxConversationsQuery(
  organizationId: string,
  filters?: Omit<CursorPaginationParams, "cursor" | "direction"> & {
    status?: string;
    search?: string;
  },
) {
  const { status, search, limit } = filters ?? {};

  // Stable queryKey without cursor/direction — cursor is pageParam
  const queryKey = CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId, {
    status,
    search,
    limit,
  });

  const result = useCursorPagination<InboxConversationsData, InboxConversationListItem>({
    queryKey,
    fetchPage: ({ cursor, direction }) =>
      inboxApiService.getConversations(organizationId, {
        status,
        search,
        limit,
        cursor: cursor ?? undefined,
        direction,
      }) as Promise<ApiResponse<InboxConversationsData>>,
    getItems: (page) => page.conversations,
    enabled: !!organizationId,
  });

  // Keep backward-compatible `data` shape for single-page consumers:
  // `data` is InfiniteData, but we also expose flattened `items` via `result.items`
  return result;
}

/** @deprecated Use useInboxConversationsQuery (now cursor-based) — kept for type compat */
export const useInboxConversationsInfiniteQuery = useInboxConversationsQuery;
