import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { getConfig } from "../config";
import { getWidgetApi } from "../services/widget-api.service";

interface VisitorSessionContextValue {
	visitorId: string | null;
	organizationId: string | null;
}

const VisitorSessionContext = createContext<VisitorSessionContextValue>({
	visitorId: null,
	organizationId: null,
});

interface VisitorSessionProviderProps {
	organizationId?: string;
	children: ReactNode;
}

/**
 * Fires on mount (visitor landing page) to start/resume the visitor session:
 * the server sets an httpOnly cookie pinning this browser to one visitor per
 * organization. Fire-and-forget - visitor tracking must never block the chat.
 *
 * The returned visitorId is exposed via context so WS presence (see
 * use-visitor-presence.ws.ts) knows which visitor to heartbeat for - the
 * gateway verifies this id against organizationId before trusting it.
 */
export function VisitorSessionProvider({
	organizationId,
	children,
}: VisitorSessionProviderProps) {
	const config = getConfig();
	const orgId = organizationId ?? config.organizationId ?? null;
	const [visitorId, setVisitorId] = useState<string | null>(null);

	useEffect(() => {
		if (!orgId) return;
		void getWidgetApi()
			.startSession(orgId, { sourceUrl: window.location.href })
			.then((res) => {
				const id = res?.data?.data?.id;
				if (id) setVisitorId(id);
			})
			.catch(() => {
				// tracking is best-effort; never surface to the visitor
			});
	}, [orgId]);

	return (
		<VisitorSessionContext.Provider value={{ visitorId, organizationId: orgId }}>
			{children}
		</VisitorSessionContext.Provider>
	);
}

export function useVisitorSession(): VisitorSessionContextValue {
	return useContext(VisitorSessionContext);
}
