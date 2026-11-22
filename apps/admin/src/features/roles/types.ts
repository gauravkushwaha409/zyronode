import type { APIError, ApiResponse } from "@package/api-client";
export interface PlatformRole {
	id: string;
	name: string;
	isSystem: boolean;
	scope: "PLATFORM";
}

export interface PlatformStaffUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profile: string | null;
	platformRole: PlatformRole | null;
	createdAt: string;
	updatedAt: string;
	_count: {
		memberships: number;
	};
}

export interface UpdatePlatformRolePayload {
	roleId: string;
}

export type PlatformStaffListResponse = ApiResponse<{ items: PlatformStaffUser[] }>;
export type PlatformRoleUpdateResponse = ApiResponse<PlatformStaffUser>;

export interface AdminPermission {
	id: string;
	key: string;
	name: string;
	description: string | null;
	module: string;
	roles?: {
		id: string;
		name: string;
		isSystem: boolean;
	}[];
}

export interface AdminRole {
	id: string;
	name: string;
	description: string | null;
	isSystem: boolean;
	scope: "PLATFORM" | "ORGANIZATION";
	organizationId: string | null;
	organization?: {
		id: string;
		name: string;
	} | null;
	permissions: AdminPermission[];
	membersCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface RoleListParams {
	search?: string;
	type?: "all" | "system" | "custom";
	scope?: "PLATFORM" | "ORGANIZATION";
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

export type AdminRolesListResponse = ApiResponse<{ items: AdminRole[] }>;
export type AdminPermissionsListResponse = ApiResponse<{
	items: AdminPermission[];
}>;
export type AdminRoleResponse = ApiResponse<AdminRole>;
export type AdminActionResponse = ApiResponse<void>;
export type AdminRolesError = APIError;
