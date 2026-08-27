import { useChannel, useEvent } from "@package/websocket";
import { useCallback } from "react";
import { useVisitorPresenceStore } from "../../store";
import type { VisitorPresenceEvent } from "../../types";

/**
 * Ephemeral presence over WebSocket. These ticks are never persisted
 * server-side, so they are kept in a client store and merged over the
 * cached rows at render time rather than written into the query cache -
 * that keeps the query cache holding only server truth.
 *
 * Must be rendered inside <WebSocketProvider>.
 */
export function useVisitorPresenceEvents(organizationId: string) {
	const applyPresence = useVisitorPresenceStore((s) => s.applyPresence);

	useChannel("agent:join", { organizationId });

	useEvent<VisitorPresenceEvent>(
		"visitor:presence",
		useCallback(
			(data) => {
				if (data?.visitorId) applyPresence(data);
			},
			[applyPresence],
		),
	);
}
