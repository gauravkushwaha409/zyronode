import { useSseEvent } from "@package/sse";
import { SSE_EVENTS, type SseConversationCreatedEvent } from "../types";

export function useConversationCreatedSse(
	handler: (event: SseConversationCreatedEvent) => void,
): void {
	useSseEvent<SseConversationCreatedEvent>(
		SSE_EVENTS.CONVERSATION_CREATED,
		handler,
	);
}
