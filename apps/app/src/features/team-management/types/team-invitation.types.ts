import type { ApiResponse, ServerResponse } from "@package/api-client";

export namespace TeamInvitation {
	export type Status = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

	export interface Item {
		id: string;
		email: string;
		status: Status;
		team: { id: string; name: string } | null;
		role: { id: string; name: string } | null;
		invitedBy: {
			id: string;
			firstName: string | null;
			lastName: string | null;
			email: string;
		} | null;
		expiresAt: string | null;
		createdAt: string;
	}

	export interface CreatePayload {
		email: string;
		roleId?: string;
		teamId?: string;
	}

	export type ListResponse = ServerResponse<Item[]>;
	export type ListAxiosResponse = ApiResponse<Item[]>;
	export type ItemAxiosResponse = ApiResponse<Item>;
	export type RevokeResponse = ServerResponse<{ id: string }>;
	export type RevokeAxiosResponse = ApiResponse<{ id: string }>;
}
