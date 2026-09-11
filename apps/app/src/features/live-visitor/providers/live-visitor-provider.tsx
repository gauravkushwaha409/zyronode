import { SseProvider } from "@package/sse";
import type { ReactNode } from "react";
import { CONFIG } from "@/config";
import { buildSseUrl } from "@/config/sse";
import { useVisitorSseEvents } from "../hooks";

interface LiveVisitorProviderProps {
	organizationId: string;
	children: ReactNode;
}

/**
 * Realtime for the live-visitor page is SSE-only: the server pushes every
 * visitor event (presence, edits, assignment, notes) over SSE, while the
 * widget sends heartbeats up over WebSocket.
 */
export function LiveVisitorProvider({
	organizationId,
	children,
}: LiveVisitorProviderProps) {
	return (
		<SseProvider
			options={{
				url: buildSseUrl(CONFIG.SSE.AGENT_VISITOR_STREAM, { organizationId }),
			}}
		>
			<LiveVisitorRealtime organizationId={organizationId} />
			{children}
		</SseProvider>
	);
}

function LiveVisitorRealtime({ organizationId }: { organizationId: string }) {
	useVisitorSseEvents(organizationId);
	return null;
}
