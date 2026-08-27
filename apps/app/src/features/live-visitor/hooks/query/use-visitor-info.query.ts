import type { APIError, ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { visitorApiService } from "../../services";
import type { VisitorInfo } from "../../types";

export function useVisitorInfoQuery(
	organizationId: string,
	visitorId: string | null,
) {
	return useQuery<ApiResponse<VisitorInfo>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.INFO(organizationId, visitorId),
		() => visitorApiService.info(organizationId, visitorId as string),
		undefined,
		{
			enabled: Boolean(organizationId && visitorId),
			staleTime: 0,
			refetchOnMount: true,
		},
	);
}
