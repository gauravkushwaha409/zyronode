import type { ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type { ConversationTypes } from "../../types/inbox-api.types";

export function useInboxConversationDetailQuery(
  conversationId: string | null,
  organizationId: string,
) {
  return useQuery<ApiResponse<ConversationTypes.InboxConversationDetail>>(
    CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversationId, organizationId),
    () => inboxApiService.getConversationDetail(conversationId!, organizationId),
    undefined,
    { enabled: !!conversationId && !!organizationId },
  );
}
