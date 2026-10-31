import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type { MessageTypes } from "../../types/message-api.types";
import {
	updateConversationDetailOnMessageUpdated,
	updateMessageListOnMessageUpdated,
} from "../../realtime";

export function useEditMessageMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation<
		ApiResponse<MessageTypes.InboxMessage>,
		APIError,
		MessageTypes.InboxEditMessagePayload & {
			conversationId: string;
			messageId: string;
		}
	>(
		({ conversationId, messageId, ...payload }) =>
			inboxApiService.editMessage(conversationId, messageId, payload),
		{
			onSuccess: (response, variables) => {
				const message = response.data?.data;
				if (!message) return;
				const event = {
					conversation: { id: variables.conversationId },
					message,
				};
				updateMessageListOnMessageUpdated(queryClient, event);
				updateConversationDetailOnMessageUpdated(
					queryClient,
					organizationId,
					event,
				);
			},
		},
	);
}
