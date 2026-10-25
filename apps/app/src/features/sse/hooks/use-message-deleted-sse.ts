import { useSseEvent } from "@package/sse";
import { SSE_EVENTS, type SseMessageDeletedEvent } from "../types";

export function useMessageDeletedSse(
	handler: (event: SseMessageDeletedEvent) => void,
): void {
	useSseEvent<SseMessageDeletedEvent>(SSE_EVENTS.MESSAGE_DELETED, handler);
}
