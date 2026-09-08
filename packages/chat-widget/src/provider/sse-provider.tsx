import { SseProvider } from "@package/sse";
import type { ReactNode } from "react";
import { getConfig } from "../config";
import { useConversation } from "./conversation-provider";

/**
 * Server-sent events stream for the visitor, scoped to a single
 * conversation (GET /api/v1/sse-event/visitor/:conversationId).
 * Renders children unconnected until a conversation exists.
 */
export function WidgetSseProvider({ children }: { children: ReactNode }) {
	const { conversationId } = useConversation();
	const config = getConfig();

	if (!conversationId) return <>{children}</>;

	return (
		<SseProvider
			options={{
				url: `${config.serverUrl}/api/v1/sse-event/visitor/${conversationId}`,
				withCredentials: false,
				retry: 2000,
				maxRetries: 10,
			}}
		>
			{children}
		</SseProvider>
	);
}
