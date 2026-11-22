import { useMutation, useQuery } from "@package/query";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { adminRolesService } from "../services/admin-roles.service";
import type {
	AdminActionResponse,
	AdminPermissionsListResponse,
	AdminRoleResponse,
	AdminRolesError,
	AdminRolesListResponse,
	CreateRolePayload,
	RoleListParams,
	UpdateRolePayload,
} from "../types";

export function useAdminRolesQuery(params?: RoleListParams) {
	return useQuery<AdminRolesListResponse, AdminRolesError>(
		[...ADMIN_QUERY_KEY.ROLES.LIST, params?.type ?? "all", params?.search ?? ""],
		() => adminRolesService.listRoles(params),
		undefined,
		{
			placeholderData: (previous: AdminRolesListResponse | undefined) => previous,
		},
	);
}

export function useAdminPermissionsQuery() {
	return useQuery<AdminPermissionsListResponse, AdminRolesError>(
		[...ADMIN_QUERY_KEY.PERMISSIONS.LIST],
		() => adminRolesService.listPermissions(),
	);
}

export function useCreateAdminRoleMutation() {
	return useMutation<AdminRoleResponse, AdminRolesError, CreateRolePayload>(
		(payload) => adminRolesService.createRole(payload),
		{ invalidateKeys: [ADMIN_QUERY_KEY.ROLES.LIST] },
	);
}

export function useUpdateAdminRoleMutation(roleId: string) {
	return useMutation<AdminRoleResponse, AdminRolesError, UpdateRolePayload>(
		(payload) => adminRolesService.updateRole(roleId, payload),
		{ invalidateKeys: [ADMIN_QUERY_KEY.ROLES.LIST] },
	);
}

export function useDeleteAdminRoleMutation(roleId: string) {
	return useMutation<AdminActionResponse, AdminRolesError, void>(
		() => adminRolesService.deleteRole(roleId),
		{ invalidateKeys: [ADMIN_QUERY_KEY.ROLES.LIST] },
	);
}
