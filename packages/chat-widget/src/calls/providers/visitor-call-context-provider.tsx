import type { CallType } from "@package/call-signaling";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import type { VisitorCallActions } from "../hooks/use-visitor-call-engine";
import {
	disabledVisitorCallActions,
	VisitorCallActionsProvider,
} from "./visitor-call-actions-context";
import { VisitorCallWebSocketProvider } from "./visitor-call-websocket-provider";

/**
 * Owns visitor call state and wires the signaling side-car.
 *
 * The side-car connects as soon as a conversation exists so the widget can
 * be rung by an agent; `startCall` either runs immediately (when the socket
 * is ready) or queues until it is.
 *
 * `children` are never re-parented, so starting a call does not remount the
 * rest of the widget.
 */
export function VisitorCallContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [actions, setActions] = useState<VisitorCallActions | null>(null);
	const actionsRef = useRef<VisitorCallActions | null>(null);
	const [pendingStart, setPendingStart] = useState<CallType | null>(null);

	const handleActionsChange = useCallback((next: VisitorCallActions | null) => {
		actionsRef.current = next;
		setActions(next);
	}, []);

	const handleStartConsumed = useCallback(() => setPendingStart(null), []);

	const startCall = useCallback(async (type: CallType) => {
		if (actionsRef.current) return actionsRef.current.startCall(type);
		setPendingStart(type);
	}, []);

	const value = useMemo<VisitorCallActions>(
		() => ({ ...(actions ?? disabledVisitorCallActions), startCall }),
		[actions, startCall],
	);

	return (
		<VisitorCallActionsProvider actions={value}>
			{children}
			<VisitorCallWebSocketProvider
				pendingStart={pendingStart}
				onStartConsumed={handleStartConsumed}
				onActionsChange={handleActionsChange}
			/>
		</VisitorCallActionsProvider>
	);
}
