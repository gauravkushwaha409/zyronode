import { useQueryClient } from "@package/query";
import { useSseEvent } from "@package/sse";
import { useCallback } from "react";
import { CONFIG } from "@/config";
import type { SseMessageCreatedEvent } from "../types";

interface UseInboxSseEventsOptions {
	organizationId: string;
}

/**
 * Subscribes to tenant-wide SSE events and keeps inbox queries fresh.
 * Must be rendered inside <SseProvider> (via InboxSseProvider).
 */
export function useInboxSseEvents({
	organizationId,
}: UseInboxSseEventsOptions) {
	const queryClient = useQueryClient();

	useSseEvent<SseMessageCreatedEvent>(
		"message.created",
		useCallback(
			(data) => {
				void queryClient.invalidateQueries({
					queryKey: CONFIG.QUERY_KEY.INBOX.SESSION_DETAIL(
						data.session.id,
						organizationId,
					),
				});
				void queryClient.invalidateQueries({
					queryKey: CONFIG.QUERY_KEY.INBOX.SESSIONS(organizationId),
				});
			},
			[queryClient, organizationId],
		),
	);
}
