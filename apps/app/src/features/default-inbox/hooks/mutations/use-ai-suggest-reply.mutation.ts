import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type { AiTypes } from "../../types/ai-api.types";

export function useAiSuggestReplyMutation() {
	return useMutation<
		ApiResponse<AiTypes.AiTextResult>,
		APIError,
		AiTypes.SuggestReplyPayload & { conversationId: string }
	>(({ conversationId, ...payload }) =>
		inboxApiService.aiSuggestReply(conversationId, payload),
	);
}
