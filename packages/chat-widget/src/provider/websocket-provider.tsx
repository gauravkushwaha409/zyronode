import { WebSocketProvider } from "@package/websocket";
import type { ReactNode } from "react";
import { getConfig } from "../config";
import { useConversation } from "./conversation-provider";

/**
 * Socket.io connection for the visitor, authenticated with the
 * conversation id. The provider is always mounted so child hooks can
 * safely call `useWebSocket`, but the socket is only opened once a
 * conversation exists.
 */
export function WidgetWebSocketProvider({ children }: { children: ReactNode }) {
	const { conversationId } = useConversation();
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
			auth={conversationId ? { conversationId } : undefined}
		>
			{children}
		</WebSocketProvider>
	);
}
