import type { APIError, ApiResponse } from "@package/api-client";

export type OrganizationPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface AdminOrganization {
	id: string;
	name: string;
	website: string | null;
	phone: string | null;
	industry: string | null;
	plan: OrganizationPlan;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	_count: {
		members: number;
		visitors: number;
		conversations: number;
		teams: number;
	};
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface AdminOrganizationListData {
	items: AdminOrganization[];
	meta: PaginationMeta;
}

export interface AdminOrganizationListParams {
	page: number;
	limit: number;
	search?: string;
}

export type AdminOrganizationListResponse =
	ApiResponse<AdminOrganizationListData>;
export type AdminOrganizationListError = APIError;
