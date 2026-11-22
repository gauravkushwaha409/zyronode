import type { APIError, ApiResponse } from "@package/api-client";

export interface PlatformRole {
	id: string;
	name: string;
	isSystem: boolean;
	scope: "PLATFORM";
}

export interface AdminUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profile: string | null;
	platformRole: PlatformRole | null;
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
