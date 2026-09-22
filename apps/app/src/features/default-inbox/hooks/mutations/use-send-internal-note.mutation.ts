import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type {
	InternalNoteTypes,
	MessageTypes,
} from "../../types/inbox-api.types";
import { applyInboxMessageEvent } from "../../utility";

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
				applyInboxMessageEvent(queryClient, organizationId, {
					conversation: { id: variables.conversationId },
					message,
				});
			},
		},
	);
}
