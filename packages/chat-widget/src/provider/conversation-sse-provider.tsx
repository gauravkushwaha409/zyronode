import { SseProvider } from "@package/sse";
import type { ReactNode } from "react";
import { useChatWidgetConfig } from "../config";
import { useVisitorSession } from "./visitor-session-context-provider";

/**
 * Server-sent events stream for the visitor, scoped to a single
 * conversation (GET /api/v1/sse/visitor/conversation/:conversationId).
 * Renders children unconnected until a conversation exists.
 */
export function WidgetConversationSseProvider({ children }: { children: ReactNode }) {
	const {
		visitorId,
		conversation: { id: conversationId },
	} = useVisitorSession();
	const config = useChatWidgetConfig();

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
