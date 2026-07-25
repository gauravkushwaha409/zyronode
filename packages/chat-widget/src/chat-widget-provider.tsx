import { createQueryClient, TanstackQueryProvider } from "@package/query";
import { SseProvider } from "@package/sse";
import { WebSocketProvider } from "@package/websocket";
import { type ReactNode, useEffect, useState } from "react";
import { getConfig } from "./config";
import { useCreateSessionMutation } from "./hooks";
import { getSessionId, setSessionId } from "./lib/storage";

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

	const [sessionId, setSessionIdState] = useState<string | null>(getSessionId);

	const { mutate: createSession } = useCreateSessionMutation();

	useEffect(() => {
		if (sessionId) return;
		createSession(
			{
				organizationId: orgId,
				sourceUrl: page ?? window.location.href,
				channel: "web",
			},
			{
				onSuccess: (res: { data?: { data?: { id?: string } } }) => {
					const id = res.data?.data?.id;
					if (id) {
						setSessionId(id);
						setSessionIdState(id);
					}
				},
				onError: (err: unknown) => {
					console.error("[chat-widget] Session creation failed:", err);
				},
			},
		);
	}, [sessionId, orgId, page, createSession]);

	if (!sessionId) return <>{children}</>;

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
			auth={{ sessionId }}
		>
			<SseProvider
				options={{
					url: `${config.websocketUrl}/events/session/${sessionId}`,
					withCredentials: false,
					retry: 5000,
					maxRetries: 10,
				}}
			>
				{children}
			</SseProvider>
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
