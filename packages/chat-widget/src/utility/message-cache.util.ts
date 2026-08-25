import type { QueryClient } from "@package/query";
import { WIDGET_QUERY_KEYS } from "@/hooks/query-keys";
import type { ChatMessage, GetMessagesAxiosResponse } from "@/types";

export interface ChatMessageEvent {
	conversation: { id: string };
	message: ChatMessage;
}

export function applyChatMessageEvent(
	queryClient: QueryClient,
	conversationId: string,
	event: ChatMessageEvent,
): void {
	if (event.conversation?.id !== conversationId) return;

	queryClient.setQueryData<GetMessagesAxiosResponse>(
		WIDGET_QUERY_KEYS.MESSAGES(conversationId),
		(previous) => {
			const current = previous?.data?.data;
			if (!current) return previous;
			const messages = current.messages.some((m) => m.id === event.message.id)
				? current.messages
				: [...current.messages, event.message];
			return {
				...previous,
				data: {
					...previous.data,
					data: { ...current, messages },
				},
			};
		},
	);
}
