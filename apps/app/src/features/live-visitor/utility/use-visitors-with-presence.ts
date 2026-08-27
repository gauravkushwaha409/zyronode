import { useMemo } from "react";
import { useVisitorPresenceStore } from "../store";
import type { VisitorListItem } from "../types";

/**
 * Overlays ephemeral WS presence ticks on top of the server rows.
 *
 * Presence is deliberately not written into the query cache (it is never
 * persisted server-side), so it is merged here at render time instead.
 */
export function useVisitorsWithPresence(
	visitors: VisitorListItem[] | undefined,
): VisitorListItem[] {
	const presence = useVisitorPresenceStore((s) => s.presence);

	return useMemo(() => {
		if (!visitors?.length) return [];

		return visitors.map((visitor) => {
			const tick = presence[visitor.id];
			if (!tick) return visitor;

			return {
				...visitor,
				isOnline: tick.isOnline,
				currentPage: tick.currentPage ?? visitor.currentPage,
				activeDuration: tick.activeDuration ?? visitor.activeDuration,
			};
		});
	}, [visitors, presence]);
}
