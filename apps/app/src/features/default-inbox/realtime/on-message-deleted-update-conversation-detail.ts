import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/inbox-api.types";
import type { MessageDeletedEvent } from "./types";

/** Removes a deleted message from the cached conversation detail, when it is loaded. */
export function updateConversationDetailOnMessageDeleted(
	queryClient: QueryClient,
	organizationId: string,
	event: MessageDeletedEvent,
): void {
	const { conversation, messageId } = event;
	if (!conversation?.id || !messageId) return;

	queryClient.setQueryData<
		ApiResponse<ConversationTypes.InboxConversationDetail>
	>(
		CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversation.id, organizationId),
		(previous) => {
			const detail = previous?.data?.data;
			if (!detail) return previous;
			if (!detail.messages.some((m) => m.id === messageId)) return previous;
			return {
				...previous,
				data: {
					...previous.data,
					data: {
						...detail,
						messages: detail.messages.filter((m) => m.id !== messageId),
					},
				},
			};
		},
	);
}
