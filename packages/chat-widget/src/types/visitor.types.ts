import type { APIError, ApiResponse } from "@package/api-client";

export namespace VisitorSessionMutation {
	export interface StartSessionPayload {
		sourceUrl?: string;
	}

	export interface VisitorData {
		id: string;
		organizationId: string;
		externalId: string | null;
		name: string | null;
		email: string | null;
		phone: string | null;
		status: "NEW" | "REVIEWED" | "CONVERTED" | "IGNORED";
		visitCount: number;
		isIdentified: boolean;
		isOnline: boolean;
		sourceUrl: string | null;
		lastSeenAt: string | null;
		createdAt: string;
		updatedAt: string;
	}

	export type StartSessionAxiosResponse = ApiResponse<VisitorData>;
	export type StartSessionError = APIError;
}
