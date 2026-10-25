import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type {
	InternalNoteTypes,
	MessageTypes,
} from "../../types/inbox-api.types";
import {
	updateConversationDetailOnMessageCreated,
	updateConversationListOnMessageCreated,
	updateMessageListOnMessageCreated,
} from "../../realtime";

export function useSendInternalNoteMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation<
		ApiResponse<MessageTypes.InboxMessage>,
		APIError,
		InternalNoteTypes.InboxCreateInternalNotePayload & { conversationId: string }
	>(
		({ conversationId, ...payload }) =>
			inboxApiService.createInternalNote(conversationId, organizationId, payload),
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
