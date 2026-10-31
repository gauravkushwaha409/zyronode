export interface ConversationDetailMessageDto {
	id: string;
	conversationId: string;
	senderType: "VISITOR" | "AGENT" | "SYSTEM";
	senderId: string | null;
	messageType: "TEXT" | "FILE" | "INTERNAL_NOTE";
	content: string;
	replyToId: string | null;
	status: "SENT" | "DELIVERED" | "READ";
	isEdited: boolean;
	editedAt: string | null;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
	replyTo: {
		id: string;
		content: string;
		senderType: "VISITOR" | "AGENT" | "SYSTEM";
		senderId: string | null;
	} | null;
}

export interface ConversationDetailDto {
	id: string;
	organizationId: string;
	visitorId: string | null;
	status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING";
	channel: string;
	visitorName: string | null;
	visitorEmail: string | null;
	visitorPhone: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	sourceUrl: string | null;
	metadata: unknown;
	deletedAt: string | null;
	deletedById: string | null;
	createdAt: string;
	updatedAt: string;
	messages: ConversationDetailMessageDto[];
}
