import {
	SOCKET_NAMESPACES,
	toWebSocketUrl,
	WebSocketProvider,
} from "@package/websocket";
import type { ReactNode } from "react";
import { getConfig } from "../config";

/**
 * Socket.io connection for the visitor, authenticated with the
 * conversation id. The provider is always mounted so child hooks can
 * safely call `useWebSocket`, but the socket is only opened once a
 * conversation exists.
 */
export function WidgetWebSocketProvider({
	namespace,
	children,
}: {
	namespace: (typeof SOCKET_NAMESPACES)[keyof typeof SOCKET_NAMESPACES];
	children: ReactNode;
}) {
	const config = getConfig();

	return (
		<WebSocketProvider
			options={{
				url: `${toWebSocketUrl(config.websocketUrl)}${namespace}`,
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: false,
			}}
			// Auth is optional: /agent classifies by token (agent vs visitor),
			// /visitor verifies visitorId/organizationId against the DB per message.
			auth={{}}
		>
			{children}
		</WebSocketProvider>
	);
}
