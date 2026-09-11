import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface UserSummary {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	profile: string | null;
}

export namespace Team {
	export interface Item {
		id: string;
		organizationId: string;
		name: string;
		description: string | null;
		leader: UserSummary | null;
		members: UserSummary[];
		membersCount: number;
	}

	export interface CreatePayload {
		name: string;
		description?: string;
		leaderId?: string;
	}

	export interface UpdatePayload {
		name?: string;
		description?: string;
		leaderId?: string | null;
	}

	export type ListResponse = ServerResponse<Item[]>;
	export type ListAxiosResponse = ApiResponse<Item[]>;
	export type ItemAxiosResponse = ApiResponse<Item>;
	export type DeleteResponse = ServerResponse<{ id: string }>;
}
