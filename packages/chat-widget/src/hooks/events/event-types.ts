export interface TypingUpdateEventData {
  conversationId: string;
  senderType: "VISITOR" | "AGENT";
  isTyping: boolean;
}

export interface MessageNewEventData {
  conversation: { id: string };
  message: {
    id: string;
    conversationId: string;
    senderType: "VISITOR" | "AGENT" | "SYSTEM";
    content: string;
    messageType: string;
    createdAt: string;
  };
}

export interface ConversationUpdatedEventData {
  conversation: {
    id: string;
    status: string;
  };
}
