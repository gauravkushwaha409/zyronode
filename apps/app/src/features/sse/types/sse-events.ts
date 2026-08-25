import type { ConnectionStatus } from "@package/sse";

export type { ConnectionStatus };

export interface SseMessage {
	id: string;
	conversationId: string;
	senderType: "VISITOR" | "AGENT" | "SYSTEM";
	senderId: string | null;
	messageType: "TEXT" | "FILE" | "INTERNAL_NOTE" | "AUDIO" | "VIDEO";
	content: string;
	replyToId: string | null;
	replyTo: {
		id: string;
		content: string;
		senderType: string;
		senderId: string | null;
	} | null;
	status: "SENT" | "DELIVERED" | "READ";
	isEdited: boolean;
	editedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SseMessageCreatedEvent {
	conversation: { id: string };
	message: SseMessage;
}

/** Server -> client event names. Keep in sync with apps/server SSE publisher. */
export const SSE_EVENTS = {
	CONNECTED: "connected",
	MESSAGE_CREATED: "message.created",
} as const;
