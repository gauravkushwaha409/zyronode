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
 * Lazy: nothing is requested from the call server until the visitor starts a
 * call. `startCall` first flips `sessionRequested`, which makes
 * `VisitorCallWebSocketProvider` fetch a token and open `/calls`; the pending
 * call type is handed to the engine as soon as it is ready.
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
	const [sessionRequested, setSessionRequested] = useState(false);
	const [pendingStart, setPendingStart] = useState<CallType | null>(null);

	const handleActionsChange = useCallback((next: VisitorCallActions | null) => {
		actionsRef.current = next;
		setActions(next);
	}, []);

	const handleStartConsumed = useCallback(() => setPendingStart(null), []);

	const startCall = useCallback(async (type: CallType) => {
		if (actionsRef.current) return actionsRef.current.startCall(type);
		setSessionRequested(true);
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
				enabled={sessionRequested}
				pendingStart={pendingStart}
				onStartConsumed={handleStartConsumed}
				onActionsChange={handleActionsChange}
			/>
		</VisitorCallActionsProvider>
	);
}
