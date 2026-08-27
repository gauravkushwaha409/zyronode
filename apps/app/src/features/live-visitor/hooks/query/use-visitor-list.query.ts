import type { APIError, ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { visitorApiService } from "../../services";
import type { VisitorListData, VisitorListParams } from "../../types";

/**
 * Live visitor data goes stale fast, so this opts out of the shared
 * 5-minute staleTime and refetches on mount.
 */
export function useVisitorListQuery(
	organizationId: string,
	params?: VisitorListParams,
) {
	return useQuery<ApiResponse<VisitorListData>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.LIST(organizationId, params),
		() => visitorApiService.list(organizationId, params),
		undefined,
		{
			enabled: Boolean(organizationId),
			staleTime: 0,
			refetchOnMount: true,
		},
	);
}
