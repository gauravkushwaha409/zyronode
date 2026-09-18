import type { CursorPaginationMeta } from "@/types/cursor-pagination.types";

export namespace ConversationTypes {
  export interface InboxConversationListItem {
    id: string;
    status: "ACTIVE" | "CLOSED" | "IDLE" | "PENDING";
    channel: string;
    visitor: {
      id: string,
      name: string,
      email: string,
      isOnline: boolean
    },
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
