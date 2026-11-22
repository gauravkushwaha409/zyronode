import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type { AiTypes } from "../../types/ai-api.types";

export function useAiRewriteMutation() {
	return useMutation<
		ApiResponse<AiTypes.AiTextResult>,
		APIError,
		AiTypes.RewritePayload
	>((payload) => inboxApiService.aiRewrite(payload));
}
