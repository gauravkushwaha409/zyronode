import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface PermissionItem {
	id: string;
	key: string;
	name: string;
	description: string | null;
	module: string;
}

export interface RoleItem {
	id: string;
	name: string;
	description: string | null;
	isSystem: boolean;
	organizationId: string | null;
	permissions: PermissionItem[];
	membersCount: number;
}

export interface CreateRolePayload {
	name: string;
	description?: string;
	permissionIds: string[];
}

export interface UpdateRolePayload {
	name?: string;
	description?: string;
	permissionIds?: string[];
}

export type RoleListResponse = ServerResponse<RoleItem[]>;
export type RoleListAxiosResponse = ApiResponse<RoleItem[]>;
export type RoleItemResponse = ServerResponse<RoleItem>;
export type RoleItemAxiosResponse = ApiResponse<RoleItem>;
export type PermissionListResponse = ServerResponse<PermissionItem[]>;
export type PermissionListAxiosResponse = ApiResponse<PermissionItem[]>;
export type DeleteRoleResponse = ServerResponse<{ id: string }>;
