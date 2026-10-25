import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import {
	updateConversationDetailOnMessageDeleted,
	updateMessageListOnMessageDeleted,
} from "../../realtime";

export function useDeleteMessageMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation<
		ApiResponse<{ message: string }>,
		APIError,
		{ conversationId: string; messageId: string }
	>(
		({ conversationId, messageId }) =>
			inboxApiService.deleteMessage(conversationId, messageId),
		{
			onSuccess: (_response, variables) => {
				const event = {
					conversation: { id: variables.conversationId },
					messageId: variables.messageId,
				};
				updateMessageListOnMessageDeleted(queryClient, event);
				updateConversationDetailOnMessageDeleted(
					queryClient,
					organizationId,
					event,
				);
			},
		},
	);
}
