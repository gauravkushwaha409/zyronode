import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { RoleListAxiosResponse } from "../../types";

export function useRolesQuery(organizationId: string) {
	return useQuery<RoleListAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.ROLE.LIST(organizationId),
		() => teamManagementApiService.listRoles(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
