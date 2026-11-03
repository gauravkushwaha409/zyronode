import type { APIError, ApiResponse } from "@package/api-client";

export type PlatformRole = "NONE" | "SUPPORT" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profile: string | null;
	platformRole: PlatformRole;
}

export interface AdminUserResponse {
	user: AdminUser;
}

export interface AdminLoginPayload {
	email: string;
	password: string;
}

export type AdminMeResponse = ApiResponse<AdminUserResponse>;
export type AdminLoginResponse = ApiResponse<AdminUserResponse>;
export type AdminLogoutResponse = ApiResponse<null>;
export type AdminAPIError = APIError;
