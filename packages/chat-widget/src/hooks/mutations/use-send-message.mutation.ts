import { useMutation, useQueryClient } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
	SendMessageAxiosResponse,
	SendMessageError,
	SendMessagePayload,
} from "../../types";
import { applyChatMessageEvent } from "../../utility";

type SendMessageVariables = SendMessagePayload & { conversationId: string };

export function useSendMessageMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		SendMessageAxiosResponse,
		SendMessageError,
		SendMessageVariables
	>(
		({ conversationId, ...payload }) =>
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
