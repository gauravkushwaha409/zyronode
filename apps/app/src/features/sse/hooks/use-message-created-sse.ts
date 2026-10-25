import { useSseEvent } from "@package/sse";
import { SSE_EVENTS, type SseMessageCreatedEvent } from "../types";

export function useMessageCreatedSse(
	handler: (event: SseMessageCreatedEvent) => void,
): void {
	useSseEvent<SseMessageCreatedEvent>(SSE_EVENTS.MESSAGE_CREATED, handler);
}
