export { useChannel } from "./react/use-channel.js";
export { useEvent } from "./react/use-event.js";
export {
	useWebSocket,
	WebSocketProvider,
	type WebSocketProviderProps,
} from "./react/websocket-provider.js";
export type {
	ConnectionStatus,
	WebSocketClientOptions,
} from "./types/index.js";
export { WebSocketClient } from "./websocket-client.js";
export { WebSocketError } from "./websocket-error.js";

/**
 * Socket.io namespaces served by apps/server. Keep in sync with the
 * `namespace` option on each @WebSocketGateway.
 */
export const SOCKET_NAMESPACES = {
	AGENT_INBOX: "/agent-inbox",
	AGENT_VISITORS: "/agent-visitors",
	VISITOR: "/visitor",
} as const;

/** socket.io upgrades http(s) itself, but clients must pass ws(s)://. */
export function toWebSocketUrl(url: string): string {
	return url.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://");
}
