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
 * Visitor signaling side-car. It is completely inert until `enabled` becomes
 * true (the visitor tapped call): only then does it fetch a call token, open
 * the `/calls` namespace, and run the call engine.
 *
 * Scope (organization + conversation) comes from the visitor session, and it
 * never wraps the widget's `children`, so connecting late never remounts the
 * widget tree.
 */
export function VisitorCallWebSocketProvider({
	enabled,
	pendingStart,
	onStartConsumed,
	onActionsChange,
}: {
	enabled: boolean;
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
		if (!enabled || !organizationId || !conversationId) return;
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
	}, [enabled, organizationId, conversationId, setStore]);

	if (!enabled || !organizationId || !token) return null;

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
