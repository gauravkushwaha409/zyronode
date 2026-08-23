import { useSseEvent } from "@package/sse";

/**
 * Backend publishes the SSE event as `message.created`
 * (see apps/server message broadcast).
 */
export function useOnMessageNew(handler: (data: unknown) => void): void {
  useSseEvent("message.created", handler);
}
