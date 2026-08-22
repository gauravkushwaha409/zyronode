import type { ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type { InboxConversationsData } from "../../types/inbox-api.types";

export function useInboxConversationsQuery(
  organizationId: string,
  filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  return useQuery<ApiResponse<InboxConversationsData>>(
    CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId, filters),
    () => inboxApiService.getConversations(organizationId, filters),
    undefined,
    { enabled: !!organizationId },
  );
}
