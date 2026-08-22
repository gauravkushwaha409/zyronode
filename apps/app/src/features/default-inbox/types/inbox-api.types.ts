export interface InboxConversationListItem {
  id: string;
  status: "ACTIVE" | "CLOSED" | "IDLE" | "PENDING";
  channel: string;
  visitorName: string | null;
  visitorEmail: string | null;
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

export interface InboxConversationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InboxConversationsData {
  conversations: InboxConversationListItem[];
  pagination: InboxConversationsPagination;
}

export interface InboxConversationsResponse {
  message: string;
  data: InboxConversationsData;
}

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
  messages: InboxMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface InboxConversationDetailResponse {
  message: string;
  data: InboxConversationDetail;
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

export interface InboxCloseConversationResponse {
  message: string;
  data: { id: string; status: string };
}

export interface InboxReopenConversationResponse {
  message: string;
  data: { id: string; status: string };
}
