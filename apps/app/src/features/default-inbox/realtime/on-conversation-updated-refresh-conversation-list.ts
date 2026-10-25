import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";

/** Refetches the conversation list after a conversation-level change. */
export function refreshConversationListOnConversationUpdated(
	queryClient: QueryClient,
	organizationId: string,
): void {
	queryClient.invalidateQueries({
		queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
	});
}
