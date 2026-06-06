import type { ApiResponse, ServerResponse } from "@package/api-client";

/**
 *
 */
export interface LoginMutationPayload {
	email: string;
	password: string;
}

/**
 *
 */
export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	lastOrgId: string | null;
	profile: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Token {
	access: string;
	refresh: string;
}

export interface LoginMutationData {
	user: User;
	tokens: Token;
}
export type LoginMutationResponse = ServerResponse<LoginMutationData>;

export type LoginMutationAxiosResponse = ApiResponse<LoginMutationData>;
