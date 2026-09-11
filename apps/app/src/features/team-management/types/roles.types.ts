import type { ApiResponse, ServerResponse } from "@package/api-client";

export namespace Permission {
	export interface Item {
		id: string;
		key: string;
		name: string;
		description: string | null;
		module: string;
	}

	export type ListResponse = ServerResponse<Item[]>;
	export type ListAxiosResponse = ApiResponse<Item[]>;
}

export namespace Role {
	export interface Item {
		id: string;
		name: string;
		description: string | null;
		isSystem: boolean;
		organizationId: string | null;
		permissions: Permission.Item[];
		membersCount: number;
	}

	export interface CreatePayload {
		name: string;
		description?: string;
		permissionIds: string[];
	}

	export interface UpdatePayload {
		name?: string;
		description?: string;
		permissionIds?: string[];
	}

	export type ListResponse = ServerResponse<Item[]>;
	export type ListAxiosResponse = ApiResponse<Item[]>;
	export type ItemResponse = ServerResponse<Item>;
	export type ItemAxiosResponse = ApiResponse<Item>;
	export type DeleteResponse = ServerResponse<{ id: string }>;
}
