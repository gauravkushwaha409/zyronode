import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type {
	InboxMessage,
	InboxSendAgentMessagePayload,
} from "../../types/inbox-api.types";
import { applyInboxMessageEvent } from "../../utility";

export function useSendAgentMessageMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation<
		ApiResponse<InboxMessage>,
		APIError,
		InboxSendAgentMessagePayload & { conversationId: string }
	>(
		({ conversationId, ...payload }) =>
			inboxApiService.sendAgentMessage(conversationId, payload),
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
