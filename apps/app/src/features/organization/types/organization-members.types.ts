import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface OrganizationMemberUser {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	profile: string | null;
}

export interface OrganizationMemberItem {
	joinedAt: string;
	user: OrganizationMemberUser;
}

export type OrganizationMembersResponse = ServerResponse<
	OrganizationMemberItem[]
>;
export type OrganizationMembersAxiosResponse = ApiResponse<
	OrganizationMemberItem[]
>;
