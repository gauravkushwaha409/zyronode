import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { RoleItemAxiosResponse, UpdateRolePayload } from "../../types";

export function useUpdateRoleMutation(organizationId: string, roleId: string) {
	return useMutation<RoleItemAxiosResponse, APIError, UpdateRolePayload>(
		(payload) =>
			teamManagementApiService.updateRole(organizationId, roleId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.ROLE.LIST(organizationId)] },
	);
}
