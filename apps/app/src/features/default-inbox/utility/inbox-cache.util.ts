import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";
import type {
	InboxConversationDetail,
	InboxConversationsData,
	InboxMessage,
} from "../types/inbox-api.types";

export interface InboxMessageEvent {
	conversation: { id: string };
	message: InboxMessage;
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

	queryClient.setQueryData<ApiResponse<InboxConversationDetail>>(
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

	queryClient.setQueriesData<ApiResponse<InboxConversationsData>>(
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
