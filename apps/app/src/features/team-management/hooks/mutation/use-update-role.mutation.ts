import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Role } from "../../types";

export function useUpdateRoleMutation(organizationId: string, roleId: string) {
	return useMutation<Role.ItemAxiosResponse, APIError, Role.UpdatePayload>(
		(payload) =>
			teamManagementApiService.updateRole(organizationId, roleId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.ROLE.LIST(organizationId)] },
	);
}
