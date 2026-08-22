import { createQueryClient, TanstackQueryProvider } from "@package/query";
import { WebSocketProvider } from "@package/websocket";
import { type ReactNode, useEffect, useState } from "react";
import { getConfig } from "./config";
import { useCreateConversationMutation } from "./hooks";
import { getConversationId, setConversationId } from "./lib/storage";

const queryClient = createQueryClient();

interface ChatWidgetProviderProps {
	children: ReactNode;
	organizationId?: string;
	page?: string;
	referrer?: string;
}

function WidgetInner({
	children,
	organizationId,
	page,
}: ChatWidgetProviderProps) {
	const config = getConfig();
	const orgId = organizationId ?? config.organizationId;

	const [conversationId, setConversationIdState] = useState<string | null>(
		getConversationId,
	);

	const { mutate: createConversation } = useCreateConversationMutation();

	useEffect(() => {
		if (conversationId) return;
		createConversation(
			{
				organizationId: orgId,
				sourceUrl: page ?? window.location.href,
				channel: "web",
			},
			{
				onSuccess: (res: { data?: { data?: { id?: string } } }) => {
					const id = res.data?.data?.id;
					if (id) {
						setConversationId(id);
						setConversationIdState(id);
					}
				},
				onError: (err: unknown) => {
					console.error("[chat-widget] Conversation creation failed:", err);
				},
			},
		);
	}, [conversationId, orgId, page, createConversation]);

	if (!conversationId) return <>{children}</>;

	return (
		<WebSocketProvider
			options={{
				url: config.websocketUrl,
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: false,
			}}
			auth={{ conversationId }}
		>
			{children}
		</WebSocketProvider>
	);
}

export function ChatWidgetProvider(props: ChatWidgetProviderProps) {
	return (
		<TanstackQueryProvider client={queryClient}>
			<WidgetInner {...props} />
		</TanstackQueryProvider>
	);
}
