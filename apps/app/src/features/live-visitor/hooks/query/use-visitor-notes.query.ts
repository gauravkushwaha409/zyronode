import type { APIError, ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { visitorApiService } from "../../services";
import type { VisitorNote } from "../../types";

export function useVisitorNotesQuery(
	organizationId: string,
	visitorId: string | null,
) {
	return useQuery<ApiResponse<VisitorNote[]>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.NOTES(organizationId, visitorId),
		() => visitorApiService.notes(organizationId, visitorId as string),
		undefined,
		{ enabled: Boolean(organizationId && visitorId) },
	);
}
