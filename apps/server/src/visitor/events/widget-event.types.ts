/**
 * Single source of truth for every server → client event emitted for the
 * visitor/widget surface. Adding a new event is: add entry here + method in
 * WidgetEventsPublisher. Call sites never hard-code string names.
 *
 * Transport mapping: some events have different WS vs SSE names
 * (historical: WS `message:new` vs SSE `message.created`). The publisher
 * hides the mapping; callers use the SSE canonical name.
 */

/** SSE canonical names (what EventSource receives). */
export const WIDGET_SSE_EVENTS = {
	MESSAGE_CREATED: "message.created",
	VISITOR_CONNECTED: "visitor.connected",
	VISITOR_DISCONNECTED: "visitor.disconnected",
	VISITOR_CREATED: "visitor.created",
	VISITOR_UPDATED: "visitor.updated",
	VISITOR_ASSIGNED: "visitor.assigned",
	VISITOR_NOTE_CREATED: "visitor.note.created",
	CONVERSATION_CREATED: "conversation.created",
	CONVERSATION_UPDATED: "conversation.updated",
	CONVERSATION_PRESENCE: "conversation.presence",
	TYPING_UPDATE: "typing.update",
} as const;

/** WebSocket names (socket.io). */
export const WIDGET_WS_EVENTS = {
	MESSAGE_NEW: "message:new",
	VISITOR_CONNECTED: "visitor.connected",
	VISITOR_DISCONNECTED: "visitor.disconnected",
	VISITOR_CREATED: "visitor.created",
	VISITOR_UPDATED: "visitor.updated",
	VISITOR_ASSIGNED: "visitor.assigned",
	VISITOR_NOTE_CREATED: "visitor.note.created",
	CONVERSATION_CREATED: "conversation:created",
	CONVERSATION_UPDATED: "conversation:updated",
	CONVERSATION_PRESENCE: "conversation:presence",
	TYPING_UPDATE: "typing:update",
} as const;

/** Mapping: SSE canonical -> WS name (used by publisher). */
export const SSE_TO_WS_EVENT_MAP: Record<string, string> = {
	[WIDGET_SSE_EVENTS.MESSAGE_CREATED]: WIDGET_WS_EVENTS.MESSAGE_NEW,
	[WIDGET_SSE_EVENTS.VISITOR_CONNECTED]: WIDGET_WS_EVENTS.VISITOR_CONNECTED,
	[WIDGET_SSE_EVENTS.VISITOR_DISCONNECTED]:
		WIDGET_WS_EVENTS.VISITOR_DISCONNECTED,
	[WIDGET_SSE_EVENTS.VISITOR_CREATED]: WIDGET_WS_EVENTS.VISITOR_CREATED,
	[WIDGET_SSE_EVENTS.VISITOR_UPDATED]: WIDGET_WS_EVENTS.VISITOR_UPDATED,
	[WIDGET_SSE_EVENTS.VISITOR_ASSIGNED]: WIDGET_WS_EVENTS.VISITOR_ASSIGNED,
	[WIDGET_SSE_EVENTS.VISITOR_NOTE_CREATED]:
		WIDGET_WS_EVENTS.VISITOR_NOTE_CREATED,
	[WIDGET_SSE_EVENTS.CONVERSATION_CREATED]:
		WIDGET_WS_EVENTS.CONVERSATION_CREATED,
	[WIDGET_SSE_EVENTS.CONVERSATION_UPDATED]:
		WIDGET_WS_EVENTS.CONVERSATION_UPDATED,
	[WIDGET_SSE_EVENTS.CONVERSATION_PRESENCE]:
		WIDGET_WS_EVENTS.CONVERSATION_PRESENCE,
	[WIDGET_SSE_EVENTS.TYPING_UPDATE]: WIDGET_WS_EVENTS.TYPING_UPDATE,
} as const;

export type WidgetSseEvent =
	(typeof WIDGET_SSE_EVENTS)[keyof typeof WIDGET_SSE_EVENTS];
export type WidgetWsEvent =
	(typeof WIDGET_WS_EVENTS)[keyof typeof WIDGET_WS_EVENTS];

/** Payloads — keep as `unknown` for message/visitor blobs to avoid coupling. */
export interface VisitorPresencePayload {
	visitorId: string;
	externalId: string | null;
	isOnline?: boolean;
}

export interface MessageCreatedPayload {
	conversation: { id: string };
	message: unknown;
}

export interface ConversationUpdatedPayload {
	conversation: unknown;
}

export interface ConversationCreatedPayload {
	conversation: unknown;
}

export interface TypingUpdatePayload {
	conversationId: string;
	senderType: string;
	isTyping: boolean;
}

export interface ConversationPresencePayload {
	conversationId: string;
	visitorId: string;
	isOnline: boolean;
}

/** For generic emit<T> typing. */
export type WidgetEventPayloadMap = {
	[WIDGET_SSE_EVENTS.MESSAGE_CREATED]: MessageCreatedPayload;
	[WIDGET_SSE_EVENTS.VISITOR_CONNECTED]: VisitorPresencePayload & {
		isOnline: true;
	};
	[WIDGET_SSE_EVENTS.VISITOR_DISCONNECTED]: VisitorPresencePayload & {
		isOnline: false;
	};
	[WIDGET_SSE_EVENTS.VISITOR_CREATED]: { visitor: unknown };
	[WIDGET_SSE_EVENTS.VISITOR_UPDATED]: { visitor: unknown };
	[WIDGET_SSE_EVENTS.VISITOR_ASSIGNED]: { visitor: unknown };
	[WIDGET_SSE_EVENTS.VISITOR_NOTE_CREATED]: { visitorId: string; note: unknown };
	[WIDGET_SSE_EVENTS.CONVERSATION_CREATED]: ConversationCreatedPayload;
	[WIDGET_SSE_EVENTS.CONVERSATION_UPDATED]: ConversationUpdatedPayload;
	[WIDGET_SSE_EVENTS.CONVERSATION_PRESENCE]: ConversationPresencePayload;
	[WIDGET_SSE_EVENTS.TYPING_UPDATE]: TypingUpdatePayload;
};
