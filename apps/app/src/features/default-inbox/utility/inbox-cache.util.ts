import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import { CONFIG } from "@/config";
import type { ConversationTypes, MessageTypes } from "../types/inbox-api.types";

interface MessagesPageData {
	messages: MessageTypes.InboxMessage[];
	pagination: unknown;
}

export interface InboxMessageEvent {
	conversation: { id: string };
	message: MessageTypes.InboxMessage;
}

export interface InboxMessageDeletedEvent {
	conversation: { id: string };
	messageId: string;
}

function messagesQueryPredicate(conversationId: string) {
	return (query: { queryKey: readonly unknown[] }) =>
		query.queryKey[0] === "inbox" &&
		query.queryKey[1] === "messages" &&
		query.queryKey[2] === conversationId;
}

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

export function applyInboxMessageEvent(
	queryClient: QueryClient,
	organizationId: string,
	event: InboxMessageEvent,
): void {
	const { conversation, message } = event;
	if (!conversation?.id || !message?.id) return;

	// The conversation body renders `useMessagesQuery` (cursor-paginated
	// ["inbox", "messages", conversationId, limit]), not CONVERSATION_DETAIL
	// below — that cache also needs the new message or it never appears
	// until a refetch. Newest messages live in the first page (the initial,
	// no-cursor fetch), so append there.
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

	queryClient.setQueryData<ApiResponse<ConversationTypes.InboxConversationDetail>>(
		CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversation.id, organizationId),
		(previous) => {
			const detail = previous?.data?.data;
			if (!detail) return previous;
			const messages = detail.messages.some((m) => m.id === message.id)
				? detail.messages
				: [...detail.messages, message];
			return {
				...previous,
				data: { ...previous.data, data: { ...detail, messages } },
			};
		},
	);

	const isConversationOpen = Boolean(
		queryClient.getQueryData(
			CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversation.id, organizationId),
		),
	);

	queryClient.setQueriesData<ApiResponse<ConversationTypes.InboxConversationsData>>(
		{ queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId) },
		(previous) => {
			const list = previous?.data?.data;
			if (!list) return previous;
			const conversations = [...list.conversations];
			const index = conversations.findIndex((c) => c.id === conversation.id);
			if (index === -1) return previous;

			const [item] = conversations.splice(index, 1);
			const updated = {
				...item,
				lastMessageAt: message.createdAt,
				lastMessage: {
					content: message.content,
					senderType: message.senderType,
					messageType: message.messageType as "TEXT" | "FILE" | "INTERNAL_NOTE",
					createdAt: message.createdAt,
				},
				unreadCount:
					message.senderType === "VISITOR" &&
					isNewToUnreadCounter(message.id) &&
					!isConversationOpen
						? item.unreadCount + 1
						: item.unreadCount,
			};

			return {
				...previous,
				data: {
					...previous.data,
					data: { ...list, conversations: [updated, ...conversations] },
				},
			};
		},
	);
}

/** Edit: replace the message wherever it lives across the paginated cache. */
export function applyInboxMessageUpdatedEvent(
	queryClient: QueryClient,
	_organizationId: string,
	event: InboxMessageEvent,
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
								messages: messages.map((m) => (m.id === message.id ? message : m)),
							},
						},
					};
				}),
			};
		},
	);
}

/** Delete: remove the message wherever it lives across the paginated cache. */
export function applyInboxMessageDeletedEvent(
	queryClient: QueryClient,
	_organizationId: string,
	event: InboxMessageDeletedEvent,
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
