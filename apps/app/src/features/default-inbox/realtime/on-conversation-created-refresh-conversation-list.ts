import type { QueryClient } from "@package/query";
import { CONFIG } from "@/config";

/** Refetches the conversation list when a new conversation is created. */
export function refreshConversationListOnConversationCreated(
	queryClient: QueryClient,
	organizationId: string,
): void {
	queryClient.invalidateQueries({
		queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
	});
}
