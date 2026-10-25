import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/inbox-api.types";
import type { MessageCreatedEvent } from "./types";

type ConversationsPage = ApiResponse<ConversationTypes.InboxConversationsData>;
type ConversationsInfinite = InfiniteData<ConversationsPage>;

const RECENT_MESSAGE_LIMIT = 500;
const recentMessageIds = new Set<string>();

function isNewToUnreadCounter(messageId: string): boolean {
	if (recentMessageIds.has(messageId)) return false;
	recentMessageIds.add(messageId);
	if (recentMessageIds.size > RECENT_MESSAGE_LIMIT) {
		const oldest = recentMessageIds.values().next().value;
		if (oldest !== undefined) recentMessageIds.delete(oldest);
	}
	return true;
}

function isConversationOpen(
	queryClient: QueryClient,
	conversationId: string,
	organizationId: string,
): boolean {
	return Boolean(
		queryClient.getQueryData(
			CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversationId, organizationId),
		),
	);
}

/** Updates the conversation list preview, ordering, and unread count after a message is created. */
export function updateConversationListOnMessageCreated(
	queryClient: QueryClient,
	organizationId: string,
	event: MessageCreatedEvent,
): void {
	const { conversation, message } = event;
	if (!conversation?.id || !message?.id) return;

	const open = isConversationOpen(queryClient, conversation.id, organizationId);

	queryClient.setQueriesData<ConversationsInfinite>(
		{ queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId) },
		(previous) => {
			if (!previous?.pages.length) return previous;

			let updatedItem: ConversationTypes.InboxConversationListItem | null =
				null;

			const pages = previous.pages.map((page) => {
				const list = page.data?.data;
				if (!list) return page;

				const index = list.conversations.findIndex(
					(c) => c.id === conversation.id,
				);
				if (index === -1) return page;

				const shouldIncrementUnread =
					message.senderType === "VISITOR" &&
					!open &&
					isNewToUnreadCounter(message.id);

				const conversations = [...list.conversations];
				const [item] = conversations.splice(index, 1);
				updatedItem = {
					...item,
					lastMessageAt: message.createdAt,
					lastMessage: {
						content: message.content,
						senderType: message.senderType,
						messageType: message.messageType as
							| "TEXT"
							| "FILE"
							| "INTERNAL_NOTE",
						createdAt: message.createdAt,
					},
					unreadCount: shouldIncrementUnread
						? item.unreadCount + 1
						: item.unreadCount,
				};

				return {
					...page,
					data: {
						...page.data,
						data: { ...list, conversations },
					},
				};
			});

			if (!updatedItem) return previous;

			const [firstPage, ...restPages] = pages;
			const firstList = firstPage.data?.data;
			if (!firstList) return previous;

			return {
				...previous,
				pages: [
					{
						...firstPage,
						data: {
							...firstPage.data,
							data: {
								...firstList,
								conversations: [updatedItem, ...firstList.conversations],
							},
						},
					},
					...restPages,
				],
			};
		},
	);
}
