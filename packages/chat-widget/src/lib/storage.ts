const CONVERSATION_KEY = "chat-widget-conversation-id";

export function getConversationId(): string | null {
  try {
    return localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

export function setConversationId(id: string): void {
  try {
    localStorage.setItem(CONVERSATION_KEY, id);
  } catch {
    /* noop */
  }
}

export function removeConversationId(): void {
  try {
    localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    /* noop */
  }
}
