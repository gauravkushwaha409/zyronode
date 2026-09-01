import { WebSocketProvider } from "@package/websocket";
import type { ReactNode } from "react";
import { getConfig } from "../config";

/**
 * Socket.io connection for the visitor, authenticated with the
 * conversation id. Renders children unconnected until a
 * conversation exists.
 */
export function WidgetWebSocketProvider({ children }: { children: ReactNode }) {
	const config = getConfig();

	return (
		<WebSocketProvider
			options={{
				url: config.websocketUrl,
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: false,
			}}
		>
			{children}
		</WebSocketProvider>
	);
}
