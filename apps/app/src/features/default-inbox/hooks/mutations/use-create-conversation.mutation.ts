import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type { ConversationTypes } from "../../types/inbox-api.types";

interface CreateConversationResult {
	id: string;
}

export function useCreateConversationMutation(organizationId: string) {
	return useMutation<
		ApiResponse<CreateConversationResult>,
		APIError,
		ConversationTypes.CreateConversationPayload
	>((payload) => inboxApiService.createConversation(payload), {
		invalidateKeys: [
			CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
			CONFIG.QUERY_KEY.VISITOR.ALL(organizationId),
		],
	});
}
