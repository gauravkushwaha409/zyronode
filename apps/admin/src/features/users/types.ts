import type { APIError, ApiResponse } from "@package/api-client";

export interface PlatformRole {
	id: string;
	name: string;
	isSystem: boolean;
	scope: "PLATFORM";
}

export interface AdminUserRow {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profile: string | null;
	platformRole: PlatformRole | null;
	isEmailVerified: boolean;
	isOnboarded: boolean;
	createdAt: string;
	updatedAt: string;
	lastOrg: { id: string; name: string } | null;
	_count: { organizations: number };
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface AdminUserListData {
	items: AdminUserRow[];
	meta: PaginationMeta;
}

export interface AdminUserListParams {
	page: number;
	limit: number;
	search?: string;
}

export type AdminUserListResponse = ApiResponse<AdminUserListData>;
export type AdminUserListError = APIError;
