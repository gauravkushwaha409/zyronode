import { useQueryClient } from "@package/query";
import { useSseEvent } from "@package/sse";
import { useCallback } from "react";
import { CONFIG } from "@/config";
import type { VisitorListItem, VisitorNote } from "../../types";

interface VisitorUpdatedEvent {
	visitor: VisitorListItem;
}

interface VisitorNoteCreatedEvent {
	visitorId: string;
	note: VisitorNote;
}

interface VisitorPresenceSseEvent {
	visitorId: string;
	externalId: string | null;
	isOnline: boolean;
}

/**
 * SSE carries the *persisted* visitor events (row edits, assignment, notes).
 * Ephemeral presence ticks arrive over WebSocket instead - see
 * use-visitor-presence-events.ts.
 *
 * Must be rendered inside <SseProvider>.
 */
export function useVisitorSseEvents(organizationId: string) {
	const queryClient = useQueryClient();

	const invalidateAll = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: CONFIG.QUERY_KEY.VISITOR.ALL(organizationId),
		});
	}, [queryClient, organizationId]);

	useSseEvent<VisitorUpdatedEvent>("visitor.updated", invalidateAll);
	useSseEvent<VisitorUpdatedEvent>("visitor.assigned", invalidateAll);
	useSseEvent<VisitorNoteCreatedEvent>("visitor.note.created", invalidateAll);
	useSseEvent<VisitorPresenceSseEvent>("visitor.connected", invalidateAll);
	useSseEvent<VisitorPresenceSseEvent>("visitor.disconnected", invalidateAll);
}
