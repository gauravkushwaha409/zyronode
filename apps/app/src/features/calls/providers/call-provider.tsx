import { SOCKET_NAMESPACES, WebSocketProvider } from "@package/websocket";
import { useEffect } from "react";
import { getAgentSocketUrl } from "@/config/socket";
import { CallScreen } from "../components/call-screen";
import { IncomingCallModal } from "../components/incoming-call-modal";
import { useCallEngine } from "../hooks/use-call-engine";
import { useCallStore } from "../store/use-call.store";
import { CallActionsProvider } from "./call-actions-context";

function CallEngineHost({ children }: { children: React.ReactNode }) {
	const actions = useCallEngine();
	return (
		<CallActionsProvider actions={actions}>
			{children}
			<IncomingCallModal />
			<CallScreen />
		</CallActionsProvider>
	);
}

export function CallProvider({
	organizationId,
	children,
}: {
	organizationId: string;
	children: React.ReactNode;
}) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	const setOrganizationId = useCallStore((s) => s.set);
	useEffect(() => {
		setOrganizationId({ organizationId });
	}, [organizationId, setOrganizationId]);
	return (
		<WebSocketProvider
			options={{
				url: getAgentSocketUrl(SOCKET_NAMESPACES.CALLS),
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: true,
			}}
			auth={{ token }}
		>
			<CallEngineHost>{children}</CallEngineHost>
		</WebSocketProvider>
	);
}
