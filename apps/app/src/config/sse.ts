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
	const isDev = CONFIG.APP.dev;
	const origin = isDev ? CONFIG.ENV.SERVER_URL : window.location.origin;

	const url = new URL(`${origin}/api/v1${path}`);

	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, value);
	}
	return url.toString();
}
