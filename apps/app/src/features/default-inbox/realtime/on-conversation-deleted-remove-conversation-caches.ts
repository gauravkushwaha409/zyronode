import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";

/** Drops the detail and message caches of a deleted conversation. */
export function removeConversationCachesOnConversationDeleted(
	queryClient: QueryClient,
	organizationId: string,
	conversationId: string,
): void {
	queryClient.removeQueries({
		queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(
			conversationId,
			organizationId,
		),
	});
	queryClient.removeQueries({
		queryKey: CONFIG.QUERY_KEY.INBOX.MESSAGES(conversationId),
	});
}
