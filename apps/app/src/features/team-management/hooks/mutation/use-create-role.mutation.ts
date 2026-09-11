import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { CreateRolePayload, RoleItemAxiosResponse } from "../../types";

export function useCreateRoleMutation(organizationId: string) {
	return useMutation<RoleItemAxiosResponse, APIError, CreateRolePayload>(
		(payload) => teamManagementApiService.createRole(organizationId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.ROLE.LIST(organizationId)] },
	);
}
