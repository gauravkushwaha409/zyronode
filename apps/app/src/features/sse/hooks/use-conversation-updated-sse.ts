import { useSseEvent } from "@package/sse";
import { SSE_EVENTS, type SseConversationUpdatedEvent } from "../types";

export function useConversationUpdatedSse(
	handler: (event: SseConversationUpdatedEvent) => void,
): void {
	useSseEvent<SseConversationUpdatedEvent>(
		SSE_EVENTS.CONVERSATION_UPDATED,
		handler,
	);
}
