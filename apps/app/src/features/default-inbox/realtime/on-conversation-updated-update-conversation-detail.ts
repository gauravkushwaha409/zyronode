import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/conversation-api.types";

/** Applies `conversation.updated` payloads to the cached conversation detail. */
export function updateConversationDetailOnConversationUpdated(
	queryClient: QueryClient,
	organizationId: string,
	conversation: ConversationTypes.InboxConversationListItem,
): void {
	if (!conversation?.id) return;

	queryClient.setQueryData<
		ApiResponse<ConversationTypes.InboxConversationDetail>
	>(
		CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversation.id, organizationId),
		(previous) => {
			const detail = previous?.data?.data;
			if (!detail) return previous;

			return {
				...previous,
				data: {
					...previous.data,
					data: {
						...detail,
						status: conversation.status,
						channel: conversation.channel,
						visitorName: conversation.visitor?.name ?? detail.visitorName,
						visitorEmail: conversation.visitor?.email ?? detail.visitorEmail,
					},
				},
			};
		},
	);
}
