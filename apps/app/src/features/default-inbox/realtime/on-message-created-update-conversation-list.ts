import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/inbox-api.types";
import type { MessageCreatedEvent } from "./types";

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
					messageType: message.messageType as
						| "TEXT"
						| "FILE"
						| "INTERNAL_NOTE",
					createdAt: message.createdAt,
				},
				unreadCount:
					message.senderType === "VISITOR" &&
					isNewToUnreadCounter(message.id) &&
					!open
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
