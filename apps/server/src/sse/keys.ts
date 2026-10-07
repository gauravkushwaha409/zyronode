/**
 * Centralized SSE / WS room key factory.
 *
 * Single source of truth for all `org:${id}` / `conversation:${id}` /
 * `visitor:${id}` keys used by SSE (SseService) and WebSocket (WebsocketService).
 * Import from here instead of inline template strings to prevent drift between
 * publisher, controller, and gateway. Redis keys live in `redis/redis.keys.ts`.
 */

// ── SSE / WS room keys (pub/sub + socket.io rooms) ──
export const SseKey = {
	org: (organizationId: string) => `org:${organizationId}` as const,
	agent: (organizationId: string) => `agent:${organizationId}` as const,
	conversation: (conversationId: string) =>
		`conversation:${conversationId}` as const,
	visitor: (visitorId: string) => `visitor:${visitorId}` as const,
} as const;

export type SseKeyType = ReturnType<(typeof SseKey)[keyof typeof SseKey]>;

// ── Helpers for tests / debugging ──
export function isOrgKey(key: string): boolean {
	return key.startsWith("org:");
}
export function isAgentKey(key: string): boolean {
	return key.startsWith("agent:");
}
export function isConversationKey(key: string): boolean {
	return key.startsWith("conversation:");
}
export function isVisitorKey(key: string): boolean {
	return key.startsWith("visitor:");
}
export function parseKey(key: string): {
	type: "org" | "agent" | "conversation" | "visitor" | "unknown";
	id: string;
} {
	if (key.startsWith("org:")) return { type: "org", id: key.slice(4) };
	if (key.startsWith("agent:")) return { type: "agent", id: key.slice(6) };
	if (key.startsWith("conversation:"))
		return { type: "conversation", id: key.slice(13) };
	if (key.startsWith("visitor:")) return { type: "visitor", id: key.slice(8) };
	return { type: "unknown", id: key };
}
