import { useQueryClient } from "@package/query";
import { useSseEvent } from "@package/sse";
import { useCallback } from "react";
import {
	applyInboxMessageDeletedEvent,
	applyInboxMessageEvent,
	applyInboxMessageUpdatedEvent,
} from "@/features/default-inbox/utility";
import type {
	SseMessageCreatedEvent,
	SseMessageDeletedEvent,
	SseMessageUpdatedEvent,
} from "../types";

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
				applyInboxMessageEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);

	useSseEvent<SseMessageUpdatedEvent>(
		"message.updated",
		useCallback(
			(data) => {
				applyInboxMessageUpdatedEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);

	useSseEvent<SseMessageDeletedEvent>(
		"message.deleted",
		useCallback(
			(data) => {
				applyInboxMessageDeletedEvent(queryClient, organizationId, data);
			},
			[queryClient, organizationId],
		),
	);
}
