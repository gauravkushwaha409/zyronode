import { SseProvider } from "@package/sse";
import type { ReactNode } from "react";
import { getConfig } from "../config";
import { useConversation } from "./conversation-provider";
import { useVisitorSession } from "./visitor-session-provider";

/**
 * Server-sent events stream for the visitor, scoped to a single
 * conversation (GET /api/v1/sse/visitor/conversation/:conversationId).
 * Renders children unconnected until a conversation exists.
 */
export function WidgetSseProvider({ children }: { children: ReactNode }) {
	const { conversationId } = useConversation();
	const { visitorId } = useVisitorSession();
	const config = getConfig();

	if (!conversationId) return <>{children}</>;

	return (
		<SseProvider
			options={{
				url: `${config.serverUrl}/api/v1/sse/visitor/conversation/${conversationId}${
					visitorId ? `?visitorId=${visitorId}` : ""
				}`,
				withCredentials: false,
				retry: 2000,
				maxRetries: 10,
			}}
		>
			{children}
		</SseProvider>
	);
}
