import { createContext, useContext } from "react";
import type { CallActions } from "../hooks/use-call-engine";

const CallActionsContext = createContext<CallActions | null>(null);

export function CallActionsProvider({
	actions,
	children,
}: {
	actions: CallActions;
	children: React.ReactNode;
}) {
	return (
		<CallActionsContext.Provider value={actions}>
			{children}
		</CallActionsContext.Provider>
	);
}

/** Call controls for dumb UI components (header buttons, modals, screens). */
export function useCallActions(): CallActions {
	const actions = useContext(CallActionsContext);
	if (!actions) {
		throw new Error("useCallActions must be used within CallProvider");
	}
	return actions;
}
