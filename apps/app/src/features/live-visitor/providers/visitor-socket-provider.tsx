import { useQueryClient } from "@package/query";
import { useChannel, useEvent, WebSocketProvider } from "@package/websocket";
import { useCallback } from "react";
import { CONFIG } from "@/config";
import { getSocketUrl } from "@/config/socket";
import { useVisitorPresenceStore } from "../store";
import type { VisitorPresenceEvent } from "../types";

interface VisitorSocketProviderProps {
	organizationId: string;
	children: React.ReactNode;
}

function VisitorSocketEvents({ organizationId }: { organizationId: string }) {
	const queryClient = useQueryClient();
	const applyPresence = useVisitorPresenceStore((s) => s.applyPresence);

	useChannel("agent:join", { organizationId });

	useEvent<VisitorPresenceEvent>(
		"visitor:presence",
		useCallback(
			(data) => {
				if (data?.visitorId) applyPresence(data);
			},
			[applyPresence],
		),
	);

	// Server may also emit visitor lifecycle over WS; keep query cache in sync
	useEvent("visitor:created", useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: CONFIG.QUERY_KEY.VISITOR.ALL(organizationId),
		});
	}, [queryClient, organizationId]));

	useEvent("visitor:updated", useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: CONFIG.QUERY_KEY.VISITOR.ALL(organizationId),
		});
	}, [queryClient, organizationId]));

	useEvent("visitor:deleted", useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: CONFIG.QUERY_KEY.VISITOR.ALL(organizationId),
		});
	}, [queryClient, organizationId]));

	return null;
}

export function VisitorSocketProvider({
	organizationId,
	children,
}: VisitorSocketProviderProps) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;

	return (
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
			<VisitorSocketEvents organizationId={organizationId} />
			{children}
		</WebSocketProvider>
	);
}
