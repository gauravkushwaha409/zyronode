import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Role } from "../../types";

export function useCreateRoleMutation(organizationId: string) {
	return useMutation<Role.ItemAxiosResponse, APIError, Role.CreatePayload>(
		(payload) => teamManagementApiService.createRole(organizationId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.ROLE.LIST(organizationId)] },
	);
}
