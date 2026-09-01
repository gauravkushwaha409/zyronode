const CONVERSATION_KEY = "chat-widget-conversation-id";

function keyForOrg(orgId?: string | null): string {
  return orgId ? `${CONVERSATION_KEY}:${orgId}` : CONVERSATION_KEY;
}

export function getConversationId(orgId?: string | null): string | null {
  try {
    if (orgId) {
      const namespaced = localStorage.getItem(keyForOrg(orgId));
      if (namespaced) return namespaced;
    }
    return localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

export function setConversationId(id: string, orgId?: string | null): void {
  try {
    localStorage.setItem(keyForOrg(orgId), id);
    // also keep global for backward compat
    if (orgId) localStorage.setItem(CONVERSATION_KEY, id);
  } catch {
    /* noop */
  }
}

export function removeConversationId(orgId?: string | null): void {
  try {
    localStorage.removeItem(keyForOrg(orgId));
    if (orgId) localStorage.removeItem(CONVERSATION_KEY);
    else {
      // remove all namespaced variants (best-effort)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith(CONVERSATION_KEY)) localStorage.removeItem(k);
      }
    }
  } catch {
    /* noop */
  }
}
