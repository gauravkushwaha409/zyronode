import { useSseEvent } from "@package/sse";
import { SSE_EVENTS, type SseMessageUpdatedEvent } from "../types";

export function useMessageUpdatedSse(
	handler: (event: SseMessageUpdatedEvent) => void,
): void {
	useSseEvent<SseMessageUpdatedEvent>(SSE_EVENTS.MESSAGE_UPDATED, handler);
}
