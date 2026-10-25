import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import {
	type MessagesPageData,
	messagesQueryPredicate,
} from "./message-queries";
import type { MessageDeletedEvent } from "./types";

/** Removes a deleted message wherever it lives across the paginated message list. */
export function updateMessageListOnMessageDeleted(
	queryClient: QueryClient,
	event: MessageDeletedEvent,
): void {
	const { conversation, messageId } = event;
	if (!conversation?.id || !messageId) return;

	queryClient.setQueriesData<InfiniteData<ApiResponse<MessagesPageData>>>(
		{ predicate: messagesQueryPredicate(conversation.id) },
		(previous) => {
			if (!previous?.pages.length) return previous;
			return {
				...previous,
				pages: previous.pages.map((page) => {
					const messages = page.data.data.messages;
					if (!messages.some((m) => m.id === messageId)) return page;
					return {
						...page,
						data: {
							...page.data,
							data: {
								...page.data.data,
								messages: messages.filter((m) => m.id !== messageId),
							},
						},
					};
				}),
			};
		},
	);
}
