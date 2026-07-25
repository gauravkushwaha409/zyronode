export interface EditMessagePayload {
  conversationUUID: string;
  messageUUID: string;
  data: {
    content: string;
  };
}
