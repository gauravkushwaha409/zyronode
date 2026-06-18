import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface MemberInfo {
	joinedAt: string;
	user: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
	};
}

export interface OrganizationItem {
	id: string;
	name: string;
	email: string;
	website: string | null;
	phone: string | null;
	industry: string | null;
	plan: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	members: MemberInfo[];
}

export type OrganizationListResponse = ServerResponse<OrganizationItem[]>;
export type OrganizationListAxiosResponse = ApiResponse<OrganizationItem[]>;
