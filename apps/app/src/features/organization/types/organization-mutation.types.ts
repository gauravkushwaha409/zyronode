import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface CreateOrganizationPayload {
	name: string;
	email: string;
	website?: string;
	phone?: string;
	industry?: string;
}

export interface OrganizationResponseData {
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
}
export type OrganizationMutationResponse =
	ServerResponse<OrganizationResponseData>;
export type OrganizationMutationAxiosResponse =
	ApiResponse<OrganizationResponseData>;
