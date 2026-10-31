export namespace MessageTypes {
	export interface InboxMessage {
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

	export interface InboxSendAgentMessagePayload {
		content: string;
		messageType?: "TEXT" | "FILE" | "INTERNAL_NOTE";
		replyToId?: string;
	}

	export interface InboxSendAgentMessageResponse {
		message: string;
		data: InboxMessage;
	}

	export interface InboxEditMessagePayload {
		content: string;
	}

	export interface InboxEditMessageResponse {
		message: string;
		data: InboxMessage;
	}

	export interface InboxDeleteMessageResponse {
		message: string;
	}
}

export namespace UploadTypes {
	export interface InboxUploadedFile {
		url: string;
		key: string;
		filename: string;
		mimeType: string;
		size: number;
	}

	export interface InboxUploadFileResponse {
		message: string;
		data: InboxUploadedFile;
	}
}
