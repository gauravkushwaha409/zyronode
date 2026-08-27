import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { organizationApiService } from "../../services";
import type { OrganizationMembers } from "../../types";

export function useOrganizationMembersQuery(organizationId: string) {
	return useQuery<
		OrganizationMembers.OrganizationMembersAxiosResponse,
		APIError
	>(
		CONFIG.QUERY_KEY.ORGANIZATION.MEMBERS(organizationId),
		() => organizationApiService.getMembers(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
