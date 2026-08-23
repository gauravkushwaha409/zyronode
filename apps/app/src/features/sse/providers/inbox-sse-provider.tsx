import { SseProvider, useSse } from "@package/sse";
import type { ReactNode } from "react";
import { CONFIG } from "@/config";
import { buildSseUrl } from "@/config/sse";
import { useInboxSseEvents } from "../hooks";

interface InboxSseProviderProps {
	organizationId: string;
	children: ReactNode;
}

/**
 * Opens the tenant-scoped agent SSE stream
 * (GET /v1/events/agent?organizationId=...).
 * Auth happens through the `access` JWT cookie that the browser
 * attaches automatically (withCredentials).
 */
export function InboxSseProvider({
	organizationId,
	children,
}: InboxSseProviderProps) {
	return (
		<SseProvider
			options={{
				url: buildSseUrl(CONFIG.SSE.AGENT_STREAM, { organizationId }),
			}}
		>
			<InboxSseEvents organizationId={organizationId} />
			{children}
		</SseProvider>
	);
}

function InboxSseEvents({ organizationId }: { organizationId: string }) {
	useInboxSseEvents({ organizationId });
	return null;
}

/** Live connection status of the SSE stream ("connecting" | "connected" | ...). */
export function useInboxSseStatus() {
	return useSse().status;
}
