import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  /** Whether there is a next page to fetch (older) */
  hasNextPage?: boolean;
  /** Whether a next page fetch is in progress */
  isFetchingNextPage?: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void;
  /** Whether there is a previous page to fetch (newer) — for bidirectional */
  hasPreviousPage?: boolean;
  /** Whether a previous page fetch is in progress */
  isFetchingPreviousPage?: boolean;
  /** Callback to fetch previous page */
  fetchPreviousPage?: () => void;
  /** Root element for IntersectionObserver — defaults to viewport. Pass scroll container for overflow-y-auto lists. */
  root?: Element | null;
  /** Root margin for early prefetch */
  rootMargin?: string;
}

/**
 * Reusable infinite scroll sentinel hook — works with any cursor-paginated list.
 * Returns refs for top (prev) and bottom (next) sentinels.
 *
 * @example
 * const { topSentinelRef, bottomSentinelRef } = useInfiniteScroll({
 *   hasNextPage, isFetchingNextPage, fetchNextPage,
 *   hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage,
 * });
 * // in JSX: <div ref={topSentinelRef} /> ...items... <div ref={bottomSentinelRef} />
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  hasPreviousPage,
  isFetchingPreviousPage,
  fetchPreviousPage,
  root,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: root ?? null, rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, root, rootMargin]);

  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el || !hasPreviousPage || isFetchingPreviousPage || !fetchPreviousPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasPreviousPage && !isFetchingPreviousPage) {
          fetchPreviousPage();
        }
      },
      { root: root ?? null, rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage, root, rootMargin]);

  return { topSentinelRef, bottomSentinelRef };
}
