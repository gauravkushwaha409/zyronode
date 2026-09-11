import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { PermissionListAxiosResponse } from "../../types";

export function usePermissionsQuery(organizationId: string) {
	return useQuery<PermissionListAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.ROLE.PERMISSIONS(organizationId),
		() => teamManagementApiService.listPermissions(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
