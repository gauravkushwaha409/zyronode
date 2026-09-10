import {
	SOCKET_NAMESPACES,
	useChannel,
	useEvent,
	WebSocketProvider,
} from "@package/websocket";
import { useCallback } from "react";
import { getAgentSocketUrl } from "@/config/socket";

/**
 * Global agent socket – single connection for all authenticated
 * dashboard users. Mount at the organization layout level.
 * Joins `org:<id>` so every agent feature (inbox, visitor, lead)
 * can rely on one underlying Socket.IO connection.
 */
interface AgentSocketProviderProps {
	organizationId: string;
	children: React.ReactNode;
}

function AgentSocketEvents({ organizationId }: { organizationId: string }) {
	useChannel("agent:join", { organizationId });

	// Global events – no-op by default, extend as needed.
	// Example: keep org membership / online presence fresh.
	useEvent("agent:online", useCallback(() => {}, []));
	useEvent("agent:offline", useCallback(() => {}, []));

	return null;
}

export function AgentSocketProvider({
	organizationId,
	children,
}: AgentSocketProviderProps) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;

	return (
		<WebSocketProvider
			options={{
				url: getAgentSocketUrl(SOCKET_NAMESPACES.AGENT_VISITORS),
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: true,
			}}
			auth={{ token }}
		>
			<AgentSocketEvents organizationId={organizationId} />
			{children}
		</WebSocketProvider>
	);
}
