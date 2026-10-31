import type { MessageTypes } from "./message-api.types";

export namespace InternalNoteTypes {
	export interface InboxCreateInternalNotePayload {
		content: string;
		replyToId?: string;
	}

	export interface InboxCreateInternalNoteResponse {
		message: string;
		data: MessageTypes.InboxMessage;
	}
}
