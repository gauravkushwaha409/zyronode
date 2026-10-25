import type { QueryClient } from "@package/query";
import type { ConversationTypes } from "../types/conversation-api.types";
import {
	findConversationListItem,
	forEachConversationList,
	matchesConversationFilters,
	withConversationPrepended,
	withConversationRemoved,
} from "./conversation-list-cache";

/** Replaces a conversation with the exact list item sent by `conversation.updated`. */
export function updateConversationListOnConversationUpdated(
	queryClient: QueryClient,
	organizationId: string,
	conversation: ConversationTypes.InboxConversationListItem,
): void {
	if (!conversation?.id) return;

	forEachConversationList(queryClient, organizationId, (data, filters) => {
		const hasExisting = Boolean(
			findConversationListItem(data, conversation.id),
		);
		const next = hasExisting
			? withConversationRemoved(data, conversation.id)
			: data;

		if (!matchesConversationFilters(conversation, filters)) return next;

		return withConversationPrepended(next, conversation);
	});
}
