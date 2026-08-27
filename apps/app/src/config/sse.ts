import { CONFIG } from ".";

export const SSE_ENDPOINTS = {
	AGENT_STREAM: "/sse-event/agent",
	CONVERSATION_STREAM: "/sse-event/conversation",
} as const;

/**
 * EventSource bypasses the axios client, so the /v1 global prefix
 * and origin are applied here.
 */
export function buildSseUrl(
	path: string,
	params?: Record<string, string>,
): string {
	const isProxy = (typeof __PROXY_ENABLED__ !== "undefined" && __PROXY_ENABLED__);
	const origin = isProxy ? "" : CONFIG.ENV.SERVER_URL;

	const url = new URL(`${origin || window.location.origin}/api/v1${path}`);

	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, value);
	}
	return url.toString();
}
