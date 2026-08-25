import { useQueryClient } from "@package/query";
import { useChannel, useEvent, WebSocketProvider } from "@package/websocket";
import { useCallback } from "react";
import { CONFIG } from "@/config";
import { applyInboxMessageEvent, type InboxMessageEvent } from "../utility";

const SOCKET_URL = window.location.origin;

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

	return (
		<WebSocketProvider
			options={{
				url: SOCKET_URL,
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
