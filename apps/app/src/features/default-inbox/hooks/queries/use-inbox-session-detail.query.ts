import type { ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type { InboxSessionDetail } from "../../types/inbox-api.types";

export function useInboxSessionDetailQuery(
  sessionId: string | null,
  organizationId: string,
) {
  return useQuery<ApiResponse<InboxSessionDetail>>(
    CONFIG.QUERY_KEY.INBOX.SESSION_DETAIL(sessionId, organizationId),
    () => inboxApiService.getSessionDetail(sessionId!, organizationId),
    undefined,
    { enabled: !!sessionId && !!organizationId },
  );
}
