import type { APIError } from "@package/api-client";
import type { CallHistoryItem } from "@package/call-signaling";
import { useQuery } from "@package/query";
import { callApiService } from "../../services/call-api.service";

export function useCallHistoryQuery(conversationId: string) {
	return useQuery<
		Awaited<ReturnType<typeof callApiService.getCallHistory>>,
		APIError
	>(
		["calls", "history", conversationId],
		() => callApiService.getCallHistory(conversationId),
		undefined,
		{ enabled: Boolean(conversationId) },
	);
}

export type { CallHistoryItem };
