import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface MeQueryData {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	profile: null;
	lastOrgId: null;
	createdAt: string;
	updatedAt: string;
}
export type MeQueryResponse = ServerResponse<MeQueryData>;

export type MeQueryAxiosResponse = ApiResponse<MeQueryData>;
