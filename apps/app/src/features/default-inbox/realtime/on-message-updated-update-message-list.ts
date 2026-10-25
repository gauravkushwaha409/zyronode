import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import {
	messagesQueryPredicate,
	type MessagesPageData,
} from "./message-queries";
import type { MessageUpdatedEvent } from "./types";

/** Replaces an edited message wherever it lives across the paginated message list. */
export function updateMessageListOnMessageUpdated(
	queryClient: QueryClient,
	event: MessageUpdatedEvent,
): void {
	const { conversation, message } = event;
	if (!conversation?.id || !message?.id) return;

	queryClient.setQueriesData<InfiniteData<ApiResponse<MessagesPageData>>>(
		{ predicate: messagesQueryPredicate(conversation.id) },
		(previous) => {
			if (!previous?.pages.length) return previous;
			return {
				...previous,
				pages: previous.pages.map((page) => {
					const messages = page.data.data.messages;
					if (!messages.some((m) => m.id === message.id)) return page;
					return {
						...page,
						data: {
							...page.data,
							data: {
								...page.data.data,
								messages: messages.map((m) =>
									m.id === message.id ? message : m,
								),
							},
						},
					};
				}),
			};
		},
	);
}
