import { SseProvider } from "@package/sse";
import { useChatWidgetConfig } from "../config";
import { useVisitorSession } from "./visitor-session-context-provider";
import { WidgetSseListener } from "./widget-sse-listener";

/**
 * Server-sent events stream scoped to a single conversation
 * (GET /api/v1/sse/visitor/conversation/:conversationId).
 *
 * Side-car: renders only the SSE listener, never the widget tree, so a
 * late-arriving conversationId doesn't remount the widget. The listener
 * is mounted (and thus subscribes) only once a conversation exists.
 */
export function WidgetConversationSseProvider({
	isWidgetOpen,
}: {
	isWidgetOpen: boolean;
}) {
	const {
		conversation: { id: conversationId },
	} = useVisitorSession();
	const config = useChatWidgetConfig();

	if (!conversationId) return null;

	return (
		<SseProvider
			options={{
				url: `${config.serverUrl}/api/v1/sse/visitor/conversation/${conversationId}`,
				withCredentials: false,
				retry: 2000,
				maxRetries: 10,
			}}
		>
			<WidgetSseListener isWidgetOpen={isWidgetOpen} />
		</SseProvider>
	);
}
