import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/inbox-api.types";
import type { MessageCreatedEvent } from "./types";

/** Appends the created message to the cached conversation detail, when it is loaded. */
export function updateConversationDetailOnMessageCreated(
	queryClient: QueryClient,
	organizationId: string,
	event: MessageCreatedEvent,
): void {
	const { conversation, message } = event;
	if (!conversation?.id || !message?.id) return;

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
}
