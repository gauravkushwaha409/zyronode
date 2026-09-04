/**
 * Reusable cursor pagination types — backend-agnostic, used across all
 * cursor-paginated lists (inbox, visitors, messages, etc.).
 *
 * Backend contract (see apps/server/src/inbox/inbox.service.ts):
 *   GET /inbox/conversations?cursor=<base64>&direction=next&limit=20
 *   → { data: { conversations: T[], pagination: CursorPaginationMeta } }
 *
 * Cursor is opaque base64url JSON {updatedAt, id} (or any stable tie-breaker).
 * Direction "next" = older (desc), "prev" = newer (desc).
 */

export type CursorDirection = "next" | "prev";

export interface CursorPaginationParams {
  /** Opaque cursor (base64). Null/undefined = first page (newest). */
  cursor?: string | null;
  /** Direction to paginate. Default "next" (older). */
  direction?: CursorDirection;
  /** Items per page 1-100, default 20. */
  limit?: number;
}

export interface CursorPaginationMeta {
  /** Echo of request limit */
  limit: number;
  /** Echo of request direction */
  direction: CursorDirection;
  /** Echo of request cursor */
  cursor: string | null;
  /** Cursor for next page (older). Null if no more. */
  nextCursor: string | null;
  /** Cursor for prev page (newer). Null if no more. */
  prevCursor: string | null;
  /** Whether a next page (older) exists */
  hasNext: boolean;
  /** Whether a prev page (newer) exists */
  hasPrev: boolean;
}

/**
 * Generic shape for a cursor-paginated response's `data` field.
 * Use intersection for domain-specific lists:
 *   type InboxConversationsData = CursorPaginatedData<InboxConversationListItem, "conversations">
 */
export type CursorPaginatedData<
  TItem,
  TKey extends string = "items",
> = {
  pagination: CursorPaginationMeta;
} & Record<TKey, TItem[]>;

/**
 * Full ApiResponse wrapper (matches @package/api-client ApiResponse<T>).
 * TData is typically CursorPaginatedData<...>
 */
export interface CursorPaginatedApiResponse<TData> {
  message: string;
  data: TData;
  // ApiResponse may also have success/statusCode — keep open
  [key: string]: unknown;
}

/** Helper for infinite query page param */
export interface CursorPageParam {
  cursor: string | null;
  direction: CursorDirection;
}
