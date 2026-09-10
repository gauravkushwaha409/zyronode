import { SOCKET_NAMESPACES } from "@package/websocket";

export function getSocketUrl(): string {
	if (typeof window === "undefined") return "";
	const isProxy =
		typeof __PROXY_ENABLED__ !== "undefined" && __PROXY_ENABLED__;
	if (isProxy) return window.location.origin;
	return __SERVER_URL__;
}

/** Agent dashboard sockets land on an agent namespace. */
export function getAgentSocketUrl(
	namespace:
		| typeof SOCKET_NAMESPACES.AGENT_INBOX
		| typeof SOCKET_NAMESPACES.AGENT_VISITORS,
): string {
	const base = getSocketUrl();
	if (!base) return "";
	return `${base}${namespace}`;
}
