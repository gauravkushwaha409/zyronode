export const SSE_ENDPOINTS = {
	AGENT_STREAM: "/sse-event/agent",
	SESSION_STREAM: "/sse-event/session",
} as const;

/**
 * EventSource bypasses the axios client, so the /v1 global prefix
 * and origin are applied here.
 */
export function buildSseUrl(path: string, params?: Record<string, string>): string {
	const url = new URL(`${window.location.origin}/v1${path}`);
	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, value);
	}
	return url.toString();
}
