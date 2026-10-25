import type { MessageTypes } from "../types/inbox-api.types";

export interface MessagesPageData {
	messages: MessageTypes.InboxMessage[];
	pagination: unknown;
}

export function messagesQueryPredicate(conversationId: string) {
	return (query: { queryKey: readonly unknown[] }) =>
		query.queryKey[0] === "inbox" &&
		query.queryKey[1] === "messages" &&
		query.queryKey[2] === conversationId;
}
