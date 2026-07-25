export interface TypingUpdateEventData {
  sessionId: string;
  senderType: "VISITOR" | "AGENT";
  isTyping: boolean;
}

export interface MessageNewEventData {
  session: { id: string };
  message: {
    id: string;
    sessionId: string;
    senderType: "VISITOR" | "AGENT" | "SYSTEM";
    content: string;
    messageType: string;
    createdAt: string;
  };
}

export interface SessionUpdatedEventData {
  session: {
    id: string;
    status: string;
  };
}
