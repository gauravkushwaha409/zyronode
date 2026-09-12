/**
 * Centralized channel / Redis key factory.
 *
 * Single source of truth for all `org:${id}` / `conversation:${id}` /
 * `visitor:${id}` keys used by SSE (SseService), WebSocket (WebsocketService),
 * and presence (Redis ZSET). Import from here instead of inline template strings
 * to prevent drift between publisher, controller, and gateway.
 */

// ── SSE / WS room keys (pub/sub + socket.io rooms) ──
export const SseKey = {
	org: (organizationId: string) => `org:${organizationId}` as const,
	conversation: (conversationId: string) => `conversation:${conversationId}` as const,
	visitor: (visitorId: string) => `visitor:${visitorId}` as const,
} as const;

export type SseKeyType = ReturnType<(typeof SseKey)[keyof typeof SseKey]>;

// ── Redis keys ──
export const RedisKey = {
	/** ZSET per org: member = visitorId, score = last heartbeat epoch ms. */
	visitorPresence: (organizationId: string) => `visitor-presence:${organizationId}` as const,
} as const;

// ── Helpers for tests / debugging ──
export function isOrgKey(key: string): boolean {
	return key.startsWith("org:");
}
export function isConversationKey(key: string): boolean {
	return key.startsWith("conversation:");
}
export function isVisitorKey(key: string): boolean {
	return key.startsWith("visitor:");
}
export function parseKey(key: string): { type: "org" | "conversation" | "visitor" | "unknown"; id: string } {
	if (key.startsWith("org:")) return { type: "org", id: key.slice(4) };
	if (key.startsWith("conversation:")) return { type: "conversation", id: key.slice(13) };
	if (key.startsWith("visitor:")) return { type: "visitor", id: key.slice(8) };
	return { type: "unknown", id: key };
}
