import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/inbox-api.types";
import type { MessageUpdatedEvent } from "./types";

/** Replaces an edited message in the cached conversation detail, when it is loaded. */
export function updateConversationDetailOnMessageUpdated(
	queryClient: QueryClient,
	organizationId: string,
	event: MessageUpdatedEvent,
): void {
	const { conversation, message } = event;
	if (!conversation?.id || !message?.id) return;

	queryClient.setQueryData<ApiResponse<ConversationTypes.InboxConversationDetail>>(
		CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversation.id, organizationId),
		(previous) => {
			const detail = previous?.data?.data;
			if (!detail) return previous;
			if (!detail.messages.some((m) => m.id === message.id)) return previous;
			return {
				...previous,
				data: {
					...previous.data,
					data: {
						...detail,
						messages: detail.messages.map((m) =>
							m.id === message.id ? message : m,
						),
					},
				},
			};
		},
	);
}
