import type { QueryClient } from "@package/query";
import type { ConversationTypes } from "../types/inbox-api.types";
import {
	findConversationListItem,
	forEachConversationList,
	matchesConversationFilters,
	withConversationPrepended,
} from "./conversation-list-cache";

/** Prepends a newly created conversation (already in list-item shape) to matching caches. */
export function updateConversationListOnConversationCreated(
	queryClient: QueryClient,
	organizationId: string,
	conversation: ConversationTypes.InboxConversationListItem,
): void {
	if (!conversation?.id) return;

	forEachConversationList(queryClient, organizationId, (data, filters) => {
		if (findConversationListItem(data, conversation.id)) return data;
		if (!matchesConversationFilters(conversation, filters)) return data;
		return withConversationPrepended(data, conversation);
	});
}
