import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import {
	type MessagesPageData,
	messagesQueryPredicate,
} from "./message-queries";
import type { MessageCreatedEvent } from "./types";

/** Appends a newly created message to the newest page of the conversation's message list. */
export function updateMessageListOnMessageCreated(
	queryClient: QueryClient,
	event: MessageCreatedEvent,
): void {
	const { conversation, message } = event;
	if (!conversation?.id || !message?.id) return;

	queryClient.setQueriesData<InfiniteData<ApiResponse<MessagesPageData>>>(
		{ predicate: messagesQueryPredicate(conversation.id) },
		(previous) => {
			if (!previous?.pages.length) return previous;
			const [firstPage, ...restPages] = previous.pages;
			const firstPageMessages = firstPage.data.data.messages;
			if (firstPageMessages.some((m) => m.id === message.id)) return previous;

			return {
				...previous,
				pages: [
					{
						...firstPage,
						data: {
							...firstPage.data,
							data: {
								...firstPage.data.data,
								messages: [...firstPageMessages, message],
							},
						},
					},
					...restPages,
				],
			};
		},
	);
}
