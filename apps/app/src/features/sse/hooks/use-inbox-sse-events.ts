import { useQueryClient } from "@package/query";
import { useCallback } from "react";
import {
	applyInboxMessageDeletedEvent,
	applyInboxMessageEvent,
	applyInboxMessageUpdatedEvent,
} from "@/features/default-inbox/utility";
import { useMessageCreatedSse } from "./use-message-created-sse";
import { useMessageDeletedSse } from "./use-message-deleted-sse";
import { useMessageUpdatedSse } from "./use-message-updated-sse";

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

	useMessageCreatedSse(
		useCallback(
			(data) => {
				applyInboxMessageEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);

	useMessageUpdatedSse(
		useCallback(
			(data) => {
				applyInboxMessageUpdatedEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);

	useMessageDeletedSse(
		useCallback(
			(data) => {
				applyInboxMessageDeletedEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);
}
