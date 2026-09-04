import { SseProvider } from "@package/sse";
import { WebSocketProvider } from "@package/websocket";
import type { ReactNode } from "react";
import { CONFIG } from "@/config";
import { buildSseUrl } from "@/config/sse";
import { getSocketUrl } from "@/config/socket";
import { useVisitorPresenceEvents, useVisitorSseEvents } from "../hooks";

interface LiveVisitorProviderProps {
	organizationId: string;
	children: ReactNode;
}



/**
 * Wires both realtime transports for the live-visitor page:
 *
 *  - SSE  -> events the server persisted (visitor edits, assignment, notes)
 *  - WS   -> ephemeral presence ticks that are never written to Postgres
 */
export function LiveVisitorProvider({
	organizationId,
	children,
}: LiveVisitorProviderProps) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;

	return (
		<SseProvider
			options={{
				url: buildSseUrl(CONFIG.SSE.AGENT_STREAM, { organizationId }),
			}}
		>
			<WebSocketProvider
				options={{
					url: getSocketUrl(),
					transports: ["websocket"],
					reconnection: true,
					reconnectionAttempts: 10,
					reconnectionDelay: 1000,
					withCredentials: true,
				}}
				auth={{ token }}
			>
				<LiveVisitorRealtime organizationId={organizationId} />
				{children}
			</WebSocketProvider>
		</SseProvider>
	);
}

function LiveVisitorRealtime({ organizationId }: { organizationId: string }) {
	useVisitorSseEvents(organizationId);
	useVisitorPresenceEvents(organizationId);
	return null;
}
