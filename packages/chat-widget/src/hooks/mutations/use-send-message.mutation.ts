import { useMutation, useQueryClient } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
	SendMessageAxiosResponse,
	SendMessageError,
	SendMessagePayload,
} from "../../types";
import { applyChatMessageEvent } from "../../utility";

type SendMessageVariables = {
	conversationId: string;
	payload: SendMessagePayload;
};

/**
 * Visitor message mutation — ONLY sends messages.
 * Conversation creation is handled separately by `ConversationProvider.ensureConversation()`.
 *
 * Usage (in ChatWidgetChat.handleSend):
 *   let activeId = conversationId;
 *   if (!activeId) activeId = await ensureConversation(); // creates POST /conversations if needed
 *   sendMessage({ conversationId: activeId, payload })
 *
 * This enforces the lazy-conversation rule: POST /conversations never fires on widget open,
 * only on first message when localStorage has no conversationId.
 */
export function useSendMessageMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		SendMessageAxiosResponse,
		SendMessageError,
		SendMessageVariables
	>(
		({ conversationId, payload }) =>
			getWidgetApi().sendVisitorMessage(conversationId, payload),
		{
			onSuccess: (response, variables) => {
				const message = response.data?.data;
				if (!message) return;
				applyChatMessageEvent(queryClient, variables.conversationId, {
					conversation: { id: variables.conversationId },
					message,
				});
			},
		},
	);
}
