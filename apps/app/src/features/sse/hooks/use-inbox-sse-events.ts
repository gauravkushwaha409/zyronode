import { useQueryClient } from "@package/query";
import { useCallback } from "react";
import {
	updateConversationDetailOnMessageCreated,
	updateConversationDetailOnMessageDeleted,
	updateConversationDetailOnMessageUpdated,
	updateConversationListOnMessageCreated,
	updateMessageListOnMessageCreated,
	updateMessageListOnMessageDeleted,
	updateMessageListOnMessageUpdated,
} from "@/features/default-inbox/realtime";
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
				updateMessageListOnMessageCreated(queryClient, data);
				updateConversationDetailOnMessageCreated(
					queryClient,
					organizationId,
					data,
				);
				updateConversationListOnMessageCreated(
					queryClient,
					organizationId,
					data,
				);
			},
			[queryClient, organizationId],
		),
	);

	useMessageUpdatedSse(
		useCallback(
			(data) => {
				updateMessageListOnMessageUpdated(queryClient, data);
				updateConversationDetailOnMessageUpdated(
					queryClient,
					organizationId,
					data,
				);
			},
			[queryClient, organizationId],
		),
	);

	useMessageDeletedSse(
		useCallback(
			(data) => {
				updateMessageListOnMessageDeleted(queryClient, data);
				updateConversationDetailOnMessageDeleted(
					queryClient,
					organizationId,
					data,
				);
			},
			[queryClient, organizationId],
		),
	);
}
