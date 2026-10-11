import {
	SOCKET_NAMESPACES,
	toWebSocketUrl,
	WebSocketProvider,
} from "@package/websocket";
import { useEffect, useState } from "react";
import { getConfig } from "../../config";
import { useConversation } from "../../provider/conversation-provider";
import { VisitorCallScreen } from "../components/visitor-call-screen";
import { VisitorIncomingCallModal } from "../components/visitor-incoming-call-modal";
import { useVisitorCallEngine } from "../hooks/use-visitor-call-engine";
import { getVisitorCallApi } from "../services/visitor-call-api.service";
import { useVisitorCallStore } from "../store/use-visitor-call.store";
import { VisitorCallActionsProvider, disabledVisitorCallActions } from "./visitor-call-actions-context";

function VisitorCallEngineHost({
	organizationId,
	token,
	children,
}: {
	organizationId: string;
	token: string;
	children: React.ReactNode;
}) {
	const actions = useVisitorCallEngine(token);
	const setStore = useVisitorCallStore((s) => s.set);
	useEffect(() => {
		setStore({ organizationId });
	}, [organizationId, setStore]);
	return (
		<VisitorCallActionsProvider actions={actions}>
			{children}
			<VisitorIncomingCallModal />
			<VisitorCallScreen />
		</VisitorCallActionsProvider>
	);
}

/**
 * Visitor signaling connection. Fetches a short-lived call token once a
 * conversation exists, then opens the /calls namespace with it. Renders
 * nothing until the token lands (no socket before that).
 */
export function VisitorCallProvider({
	organizationId,
	children,
}: {
	organizationId: string | null;
	children: React.ReactNode;
}) {
	const { conversationId } = useConversation();
	const [token, setToken] = useState<string | null>(null);
	const setStore = useVisitorCallStore((s) => s.set);

	useEffect(() => {
		if (!organizationId || !conversationId) return;
		setStore({ conversationId });
		let live = true;
		void getVisitorCallApi()
			.getCallToken(organizationId, conversationId)
			.then((res) => {
				if (live) setToken(res.data.data.token);
			})
			.catch(() => {
				// Calling stays unavailable - chat is unaffected.
			});
		return () => {
			live = false;
		};
	}, [organizationId, conversationId, setStore]);

	if (!organizationId || !token) {
		return (
			<VisitorCallActionsProvider actions={disabledVisitorCallActions}>
				{children}
			</VisitorCallActionsProvider>
		);
	}

	return (
		<WebSocketProvider
			options={{
				url: `${toWebSocketUrl(getConfig().serverUrl)}${SOCKET_NAMESPACES.CALLS}`,
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: false,
			}}
			auth={{ token }}
		>
			<VisitorCallEngineHost organizationId={organizationId} token={token}>
				{children}
			</VisitorCallEngineHost>
		</WebSocketProvider>
	);
}
