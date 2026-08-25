import { useMutation, useQueryClient } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
	SendMessageAxiosResponse,
	SendMessageError,
	SendMessagePayload,
} from "../../types";
import { applyChatMessageEvent } from "../../utility";

export function useSendMessageMutation(conversationId: string) {
	const queryClient = useQueryClient();

	return useMutation<
		SendMessageAxiosResponse,
		SendMessageError,
		SendMessagePayload
	>(
		(payload: SendMessagePayload) =>
			getWidgetApi().sendVisitorMessage(conversationId, payload),
		{
			onSuccess: (response) => {
				const message = response.data?.data;
				if (!message) return;
				applyChatMessageEvent(queryClient, conversationId, {
					conversation: { id: conversationId },
					message,
				});
			},
		},
	);
}
