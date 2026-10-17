import { SseProvider } from "@package/sse";
import type { ReactNode } from "react";
import { useChatWidgetConfig } from "../config";
import { useVisitorSession } from "./visitor-session-context-provider";

export function WidgetVisitorSseProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { visitorId } = useVisitorSession();
	const config = useChatWidgetConfig();

	return (
		<>
			{visitorId ? (
				<SseProvider
					key={visitorId}
					options={{
						url: `${config.serverUrl}/api/v1/sse/visitor/${visitorId}`,
						withCredentials: false,
						retry: 2000,
						maxRetries: 10,
					}}
				>
					{children}
				</SseProvider>
			) : (
				children
			)}
		</>
	);
}
