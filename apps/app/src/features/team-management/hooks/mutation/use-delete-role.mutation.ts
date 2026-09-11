import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { DeleteRoleResponse } from "../../types";

export function useDeleteRoleMutation(organizationId: string, roleId: string) {
	return useMutation<DeleteRoleResponse, APIError, void>(
		() => teamManagementApiService.deleteRole(organizationId, roleId),
		{ invalidateKeys: [CONFIG.QUERY_KEY.ROLE.LIST(organizationId)] },
	);
}
