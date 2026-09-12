import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Role } from "../../types";

export function useRolesQuery(organizationId: string) {
	return useQuery<Role.ListAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.ROLE.LIST(organizationId),
		() => teamManagementApiService.listRoles(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
