import { BaseAPIService } from "@package/api-client";
import { ADMIN_ENDPOINTS } from "@/config/admin-api";
import { apiClient } from "@/lib/api-client";
import type {
	AdminActionResponse,
	AdminPermission,
	AdminPermissionsListResponse,
	AdminRole,
	AdminRoleResponse,
	AdminRolesListResponse,
	CreateRolePayload,
	RoleListParams,
	UpdateRolePayload,
} from "../types";

class AdminRolesService extends BaseAPIService {
	listRoles(params?: RoleListParams) {
		return super.get<{ items: AdminRole[] }, AdminRolesListResponse>(
			ADMIN_ENDPOINTS.ROLES.LIST,
			{ params },
		);
	}

	listPermissions() {
		return super.get<{ items: AdminPermission[] }, AdminPermissionsListResponse>(
			ADMIN_ENDPOINTS.PERMISSIONS.LIST,
		);
	}

	createRole(payload: CreateRolePayload) {
		return super.post<AdminRole, AdminRoleResponse>(
			ADMIN_ENDPOINTS.ROLES.CREATE,
			payload,
		);
	}

	updateRole(roleId: string, payload: UpdateRolePayload) {
		return super.patch<UpdateRolePayload>(
			ADMIN_ENDPOINTS.ROLES.UPDATE(roleId),
			payload,
		) as Promise<AdminRoleResponse>;
	}

	deleteRole(roleId: string) {
		return super.delete(
			ADMIN_ENDPOINTS.ROLES.DELETE(roleId),
		) as Promise<AdminActionResponse>;
	}
}

export const adminRolesService = new AdminRolesService(apiClient);
