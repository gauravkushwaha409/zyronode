import { useQueryClient } from "@package/query";
import {
	SOCKET_NAMESPACES,
	useChannel,
	useEvent,
	WebSocketProvider,
} from "@package/websocket";
import { useCallback } from "react";
import { CONFIG } from "@/config";
import { getAgentSocketUrl } from "@/config/socket";
import { applyInboxMessageEvent, type InboxMessageEvent } from "../utility";

interface InboxSocketProviderProps {
	organizationId: string;
	children: React.ReactNode;
}

interface ConversationUpdatedEvent {
	conversation: { id: string };
}

function InboxSocketEvents({ organizationId }: { organizationId: string }) {
	const queryClient = useQueryClient();

	useChannel("agent:join", { organizationId });

	useEvent<InboxMessageEvent>(
		"message:new",
		useCallback(
			(data) => {
				applyInboxMessageEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);

	useEvent<ConversationUpdatedEvent>(
		"conversation:updated",
		useCallback(() => {
			queryClient.invalidateQueries({
				queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
			});
		}, [queryClient, organizationId]),
	);

	return null;
}

export function InboxSocketProvider({
	organizationId,
	children,
}: InboxSocketProviderProps) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	console.log(
		"inbox socket url:",
		getAgentSocketUrl(SOCKET_NAMESPACES.AGENT_INBOX),
	);
	return (
		<WebSocketProvider
			options={{
				url: getAgentSocketUrl(SOCKET_NAMESPACES.AGENT_INBOX),
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: true,
			}}
			auth={{ token }}
		>
			<InboxSocketEvents organizationId={organizationId} />
			{children}
		</WebSocketProvider>
	);
}
