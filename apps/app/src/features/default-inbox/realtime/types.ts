import type { ConversationTypes, MessageTypes } from "../types/inbox-api.types";

export interface MessageCreatedEvent {
	conversation: { id: string };
	message: MessageTypes.InboxMessage;
}

export interface MessageUpdatedEvent {
	conversation: { id: string };
	message: MessageTypes.InboxMessage;
}

export interface MessageDeletedEvent {
	conversation: { id: string };
	messageId: string;
}

/** `conversation.updated` now emits the exact conversation-list item. */
export type ConversationUpdatedEvent =
	ConversationTypes.InboxConversationListItem;
