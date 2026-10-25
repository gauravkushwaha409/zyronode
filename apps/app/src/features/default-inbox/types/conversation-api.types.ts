import type { CursorPaginationMeta } from "@/types/cursor-pagination.types";
import type { MessageTypes } from "./message-api.types";

export namespace ConversationTypes {
	export interface InboxConversationListItem {
		id: string;
		status: "ACTIVE" | "CLOSED" | "IDLE" | "PENDING";
		channel: string;
		visitor: {
			id: string;
			name: string | null;
			email: string | null;
			isOnline: boolean;
		} | null;
		lastMessageAt: string;
		createdAt: string;
		lastMessage: {
			content: string;
			senderType: "VISITOR" | "AGENT" | "SYSTEM";
			messageType: "TEXT" | "FILE" | "INTERNAL_NOTE";
			createdAt: string;
		} | null;
		unreadCount: number;
	}

	// Re-export for reuse — inbox now uses cursor pagination exclusively
	export type InboxConversationsPagination = CursorPaginationMeta;

	export interface InboxConversationsData {
		conversations: InboxConversationListItem[];
		pagination: CursorPaginationMeta;
	}

	export interface InboxConversationsResponse {
		message: string;
		data: InboxConversationsData;
	}

	export interface InboxConversationDetail {
		id: string;
		organizationId: string;
		status: "ACTIVE" | "CLOSED" | "IDLE" | "PENDING";
		channel: string;
		visitorName: string | null;
		visitorEmail: string | null;
		visitorPhone: string | null;
		ipAddress: string | null;
		userAgent: string | null;
		sourceUrl: string | null;
		metadata: unknown;
		messages: MessageTypes.InboxMessage[];
		createdAt: string;
		updatedAt: string;
	}

	export interface InboxConversationDetailResponse {
		message: string;
		data: InboxConversationDetail;
	}

	export interface CreateConversationPayload {
		organizationId: string;
		visitorId?: string;
		sourceUrl?: string;
		visitorName?: string | null;
		visitorEmail?: string | null;
		visitorPhone?: string | null;
		channel?: string;
		metadata?: Record<string, unknown>;
	}

	export interface InboxCloseConversationResponse {
		message: string;
		data: { id: string; status: string };
	}

	export interface InboxReopenConversationResponse {
		message: string;
		data: { id: string; status: string };
	}
}
