import { SseProvider } from "@package/sse";
import { useChatWidgetConfig } from "../config";
import { useVisitorSession } from "./visitor-session-context-provider";

/**
 * Visitor SSE stream (GET /api/v1/sse/visitor/:visitorId).
 *
 * Side-car: does not wrap the widget tree, so a late-arriving visitorId
 * never remounts the widget. Renders without children (no listener consumes
 * this stream today).
 */
export function WidgetVisitorSseProvider() {
	const { visitorId } = useVisitorSession();
	const config = useChatWidgetConfig();

	if (!visitorId) return null;

	return (
		<SseProvider
			key={visitorId}
			options={{
				url: `${config.serverUrl}/api/v1/sse/visitor/${visitorId}`,
				withCredentials: false,
				retry: 2000,
				maxRetries: 10,
			}}
		>
			<span style={{ display: "none" }} />
		</SseProvider>
	);
}
