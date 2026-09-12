import { SseProvider } from "@package/sse";
import type { ReactNode } from "react";
import { getConfig } from "../config";
import { useVisitorSession } from "./visitor-session-provider";

/**
 * Public visitor-scoped SSE — connects immediately after the visitor
 * session is established (`POST /widget/organizations/:id/session`).
 * Unlike `WidgetSseProvider` (conversation-scoped), this does **not**
 * require a conversationId, so it hits the server on widget load and
 * can deliver pre-conversation information (welcome, assignment, etc.)
 * via `GET /api/v1/widget/sse/visitor/:visitorId`.
 */
export function WidgetVisitorSseProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { visitorId } = useVisitorSession();
	const config = getConfig();

	// Render visitor SSE as a side-car sibling so mounting it does NOT
	// re-parent / re-mount `children`. The previous `if (!visitorId) return <>`
	// -> `<SseProvider>{children}</SseProvider>` pattern caused the entire
	// subtree (including WidgetSseProvider for the conversation) to remount
	// when visitorId became available, which produced two concurrent
	// `GET /sse/visitor/conversation/:id` EventSources.
	return (
		<>
			{visitorId ? (
				<SseProvider
					key={visitorId}
					options={{
						url: `${config.serverUrl}/api/v1/widget/sse/visitor/${visitorId}`,
						withCredentials: false,
						retry: 2000,
						maxRetries: 10,
					}}
				>
					{/* side-car connection, no UI */}
					<span style={{ display: "none" }} />
				</SseProvider>
			) : null}
			{children}
		</>
	);
}
