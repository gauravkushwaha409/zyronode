import type { CallType } from "@package/call-signaling";
import {
	SOCKET_NAMESPACES,
	toWebSocketUrl,
	WebSocketProvider,
} from "@package/websocket";
import { useEffect, useState } from "react";
import { useChatWidgetConfig } from "../../config";
import { useVisitorSession } from "../../provider/visitor-session-context-provider";
import { VisitorCallScreen } from "../components/visitor-call-screen";
import { VisitorIncomingCallModal } from "../components/visitor-incoming-call-modal";
import {
	useVisitorCallEngine,
	type VisitorCallActions,
} from "../hooks/use-visitor-call-engine";
import { getVisitorCallApi } from "../services/visitor-call-api.service";
import { useVisitorCallStore } from "../store/use-visitor-call.store";

function VisitorCallEngineHost({
	token,
	pendingStart,
	onStartConsumed,
	onActionsChange,
}: {
	token: string;
	pendingStart: CallType | null;
	onStartConsumed: () => void;
	onActionsChange: (actions: VisitorCallActions | null) => void;
}) {
	const actions = useVisitorCallEngine(token);

	useEffect(() => {
		onActionsChange(actions);
		return () => onActionsChange(null);
	}, [actions, onActionsChange]);

	useEffect(() => {
		if (!pendingStart) return;
		onStartConsumed();
		void actions.startCall(pendingStart);
	}, [pendingStart, actions, onStartConsumed]);

	return (
		<>
			<VisitorIncomingCallModal />
			<VisitorCallScreen />
		</>
	);
}

/**
 * Visitor signaling side-car. Opens the `/calls` namespace as soon as a
 * conversation exists so the widget can be rung by an agent; the engine is
 * mounted once the call token lands.
 */
export function VisitorCallWebSocketProvider({
	pendingStart,
	onStartConsumed,
	onActionsChange,
}: {
	pendingStart: CallType | null;
	onStartConsumed: () => void;
	onActionsChange: (actions: VisitorCallActions | null) => void;
}) {
	const {
		organizationId,
		conversation: { id: conversationId },
	} = useVisitorSession();
	const config = useChatWidgetConfig();
	const [token, setToken] = useState<string | null>(null);
	const setStore = useVisitorCallStore((s) => s.set);

	useEffect(() => {
		if (!organizationId) return;
		setStore({ organizationId });
	}, [organizationId, setStore]);

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

	if (!organizationId || !conversationId || !token) return null;

	return (
		<WebSocketProvider
			options={{
				url: `${toWebSocketUrl(config.serverUrl)}${SOCKET_NAMESPACES.CALLS}`,
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: false,
			}}
			auth={{ token }}
		>
			<VisitorCallEngineHost
				token={token}
				pendingStart={pendingStart}
				onStartConsumed={onStartConsumed}
				onActionsChange={onActionsChange}
			/>
		</WebSocketProvider>
	);
}
