import { type ReactNode, useEffect } from "react";
import { getConfig } from "../config";
import { getWidgetApi } from "../services/widget-api.service";

interface VisitorSessionProviderProps {
	organizationId?: string;
	children: ReactNode;
}

/**
 * Fires on mount (visitor landing page) to start/resume the visitor session:
 * the server sets an httpOnly cookie pinning this browser to one visitor per
 * organization. Fire-and-forget - visitor tracking must never block the chat.
 */
export function VisitorSessionProvider({
	organizationId,
	children,
}: VisitorSessionProviderProps) {
	const config = getConfig();
	const orgId = organizationId ?? config.organizationId;

	useEffect(() => {
		if (!orgId) return;
		void getWidgetApi()
			.startSession(orgId, { sourceUrl: window.location.href })
			.catch(() => {
				// tracking is best-effort; never surface to the visitor
			});
	}, [orgId]);

	return <>{children}</>;
}
