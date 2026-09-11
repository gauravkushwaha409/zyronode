import type { APIError, ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type { UserSummary } from "../../types";

export interface OrganizationMemberItem {
	joinedAt: string;
	role: { id: string; name: string; isSystem: boolean } | null;
	user: UserSummary;
}

export type OrganizationMembersAxiosResponse = ApiResponse<
	OrganizationMemberItem[]
>;

export function useOrganizationMembersQuery(organizationId: string) {
	return useQuery<OrganizationMembersAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.ORGANIZATION.MEMBERS(organizationId),
		() => apiClient.get(CONFIG.ENDPOINTS.ORGANIZATION.MEMBERS(organizationId)),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
