import type { QueryClient } from "@package/query";
import {
	forEachConversationList,
	withConversationRemoved,
} from "./conversation-list-cache";

/** Removes a deleted conversation from every matching conversation list cache. */
export function updateConversationListOnConversationDeleted(
	queryClient: QueryClient,
	organizationId: string,
	conversationId: string,
): void {
	if (!conversationId) return;

	forEachConversationList(queryClient, organizationId, (data) =>
		withConversationRemoved(data, conversationId),
	);
}
