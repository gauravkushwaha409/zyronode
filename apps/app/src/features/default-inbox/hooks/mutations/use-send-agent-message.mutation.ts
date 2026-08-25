import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type {
	InboxMessage,
	InboxSendAgentMessagePayload,
} from "../../types/inbox-api.types";
import { applyInboxMessageEvent } from "../../utility";

export function useSendAgentMessageMutation(
	conversationId: string,
	organizationId: string,
) {
	const queryClient = useQueryClient();

	return useMutation<
		ApiResponse<InboxMessage>,
		APIError,
		InboxSendAgentMessagePayload
	>((payload) => inboxApiService.sendAgentMessage(conversationId, payload), {
		onSuccess: (response) => {
			const message = response.data?.data;
			if (!message) return;
			applyInboxMessageEvent(queryClient, organizationId, {
				conversation: { id: conversationId },
				message,
			});
		},
	});
}
