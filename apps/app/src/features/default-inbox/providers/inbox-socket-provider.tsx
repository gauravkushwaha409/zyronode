import { useQueryClient } from "@package/query";
import {
	SOCKET_NAMESPACES,
	useChannel,
	useEvent,
	WebSocketProvider,
} from "@package/websocket";
import { useCallback } from "react";
import { getAgentSocketUrl } from "@/config/socket";
import {
	type MessageCreatedEvent,
	updateConversationDetailOnMessageCreated,
	updateConversationListOnMessageCreated,
	updateMessageListOnMessageCreated,
} from "../realtime";

interface InboxSocketProviderProps {
	organizationId: string;
	children: React.ReactNode;
}

function InboxSocketEvents({ organizationId }: { organizationId: string }) {
	const queryClient = useQueryClient();

	useChannel("agent:join", { organizationId });

	useEvent<MessageCreatedEvent>(
		"message:new",
		useCallback(
			(data) => {
				updateMessageListOnMessageCreated(queryClient, data);
				updateConversationDetailOnMessageCreated(
					queryClient,
					organizationId,
					data,
				);
				updateConversationListOnMessageCreated(
					queryClient,
					organizationId,
					data,
				);
			},
			[queryClient, organizationId],
		),
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
