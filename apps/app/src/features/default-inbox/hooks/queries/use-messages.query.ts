import type { ApiResponse } from "@package/api-client";
import { CONFIG } from "@/config";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import type { CursorPaginationParams } from "@/types/cursor-pagination.types";
import { inboxApiService } from "../../services/inbox-api.service";
import type { InboxMessage } from "../../types/inbox-api.types";

interface MessagesData {
	messages: InboxMessage[];
	pagination: import("@/types/cursor-pagination.types").CursorPaginationMeta;
}

export function useMessagesQuery(
	conversationId: string | null,
	filters?: Omit<CursorPaginationParams, "cursor" | "direction">,
) {
	const { limit } = filters ?? {};
	const queryKey = CONFIG.QUERY_KEY.INBOX.MESSAGES(conversationId, limit);

	return useCursorPagination<MessagesData, InboxMessage>({
		queryKey,
		fetchPage: ({ cursor, direction }) =>
			inboxApiService.getMessages(conversationId!, {
				cursor: cursor ?? undefined,
				direction,
				limit,
			}) as Promise<ApiResponse<MessagesData>>,
		getItems: (page) => page.messages,
		enabled: !!conversationId,
	});
}
