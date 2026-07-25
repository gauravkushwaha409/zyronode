import type { ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type { InboxSessionsData } from "../../types/inbox-api.types";

export function useInboxSessionsQuery(
  organizationId: string,
  filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  return useQuery<ApiResponse<InboxSessionsData>>(
    CONFIG.QUERY_KEY.INBOX.SESSIONS(organizationId, filters),
    () => inboxApiService.getSessions(organizationId, filters),
    undefined,
    { enabled: !!organizationId },
  );
}
