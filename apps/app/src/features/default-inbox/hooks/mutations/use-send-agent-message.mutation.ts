import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type { MessageTypes } from "../../types/message-api.types";
import {
	updateConversationDetailOnMessageCreated,
	updateConversationListOnMessageCreated,
	updateMessageListOnMessageCreated,
} from "../../realtime";

export function useSendAgentMessageMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation<
		ApiResponse<MessageTypes.InboxMessage>,
		APIError,
		MessageTypes.InboxSendAgentMessagePayload & { conversationId: string }
	>(
		({ conversationId, ...payload }) =>
			inboxApiService.sendAgentMessage(conversationId, payload),
		{
			onSuccess: (response, variables) => {
				const message = response.data?.data;
				if (!message) return;
				const event = {
					conversation: { id: variables.conversationId },
					message,
				};
				updateMessageListOnMessageCreated(queryClient, event);
				updateConversationDetailOnMessageCreated(
					queryClient,
					organizationId,
					event,
				);
				updateConversationListOnMessageCreated(
					queryClient,
					organizationId,
					event,
				);
			},
		},
	);
}
