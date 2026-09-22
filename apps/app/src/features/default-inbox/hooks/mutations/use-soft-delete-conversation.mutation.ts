import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation, useQueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type { ConversationTypes } from "../../types/inbox-api.types";
import { useConversationItem } from "../custom/use-conversation-item.custom";

export function useSoftDeleteConversationMutation(organizationId: string) {
	const queryClient = useQueryClient();
	const { value: selectedId, onChange: setSelected } = useConversationItem();

	return useMutation<
		ApiResponse<{ id: string }>,
		APIError,
		{ conversationId: string }
	>(
		({ conversationId }) =>
			inboxApiService.softDeleteConversation(conversationId, organizationId),
		{
			onSuccess: (_data, { conversationId }) => {
				// Remove from infinite list cache (all pages + filter variants)
				queryClient.setQueriesData<
					InfiniteData<ApiResponse<ConversationTypes.InboxConversationsData>>
				>(
					{ queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId) },
					(old) => {
						if (!old) return old;
						return {
							...old,
							pages: old.pages.map((page) => ({
								...page,
								data: {
									...page.data,
									data: {
										...page.data.data,
										conversations: page.data.data.conversations.filter(
											(c) => c.id !== conversationId,
										),
									},
								},
							})),
						} as InfiniteData<ApiResponse<ConversationTypes.InboxConversationsData>>;
					},
				);

				// Also handle non-infinite cache shape (setQueriesData with same key)
				queryClient.setQueriesData<ApiResponse<ConversationTypes.InboxConversationsData>>(
					{ queryKey: ["inbox", "conversations", organizationId] },
					(old) => {
						if (!old?.data?.data?.conversations) return old;
						return {
							...old,
							data: {
								...old.data,
								data: {
									...old.data.data,
									conversations: old.data.data.conversations.filter(
										(c) => c.id !== conversationId,
									),
								},
							},
						} as ApiResponse<ConversationTypes.InboxConversationsData>;
					},
				);

				// Remove detail cache
				queryClient.removeQueries({
					queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(
						conversationId,
						organizationId,
					),
				});
				queryClient.removeQueries({
					queryKey: CONFIG.QUERY_KEY.INBOX.MESSAGES(conversationId),
				});

				// Clear selection if deleted conversation was open
				if (selectedId === conversationId) {
					setSelected(null);
				}

				// Invalidate unread stats
				queryClient.invalidateQueries({
					queryKey: CONFIG.QUERY_KEY.INBOX.UNREAD_STATS,
				});
			},
		},
	);
}
