import { createContext, useContext } from "react";
import type { VisitorCallActions } from "../hooks/use-visitor-call-engine";

const VisitorCallActionsContext = createContext<VisitorCallActions | null>(
	null,
);

export function VisitorCallActionsProvider({
	actions,
	children,
}: {
	actions: VisitorCallActions;
	children: React.ReactNode;
}) {
	return (
		<VisitorCallActionsContext.Provider value={actions}>
			{children}
		</VisitorCallActionsContext.Provider>
	);
}

export function useVisitorCallActions(): VisitorCallActions {
	const actions = useContext(VisitorCallActionsContext);
	if (!actions) {
		throw new Error(
			"useVisitorCallActions must be used within VisitorCallProvider",
		);
	}
	return actions;
}
