import { useSseEvent } from "@package/sse";
import { SSE_EVENTS, type SseConversationDeletedEvent } from "../types";

export function useConversationDeletedSse(
	handler: (conversationId: SseConversationDeletedEvent) => void,
): void {
	useSseEvent<SseConversationDeletedEvent>(
		SSE_EVENTS.CONVERSATION_DELETED,
		handler,
	);
}
