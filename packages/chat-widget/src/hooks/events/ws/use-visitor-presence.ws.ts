import { useWebSocket } from "@package/websocket";
import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * Heartbeats visitor:presence to the gateway (see apps/server VisitorGateway)
 * so Redis knows this visitor is online, and emits visitor:left on tab
 * close/navigate-away. Both organizationId and visitorId come from
 * VisitorSessionProvider - the gateway re-verifies them against the DB
 * before trusting anything, so nothing here is a security boundary.
 *
 * Best-effort only: presence tracking must never throw into the widget.
 */
export function useVisitorPresence(
	organizationId: string | null,
	visitorId: string | null,
): void {
	const { client, status } = useWebSocket();

	useEffect(() => {
		if (!organizationId || !visitorId || status !== "connected") return;

		const startedAt = Date.now();
		const sendHeartbeat = () => {
			try {
				client.emit("visitor:presence", {
					organizationId,
					visitorId,
					currentPage: window.location.href,
					activeDuration: Math.round((Date.now() - startedAt) / 1000),
				});
			} catch {
				// best-effort - dropped heartbeat is fine, next tick retries
			}
		};

		sendHeartbeat();
		const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

		const sendLeft = () => {
			try {
				client.emit("visitor:left", { organizationId, visitorId });
			} catch {
				// tab is already closing - nothing to recover
			}
		};
		window.addEventListener("pagehide", sendLeft);

		return () => {
			clearInterval(interval);
			window.removeEventListener("pagehide", sendLeft);
			sendLeft();
		};
	}, [client, organizationId, visitorId, status]);
}
