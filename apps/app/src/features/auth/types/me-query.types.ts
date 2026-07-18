import type {
	APIError,
	ApiResponse,
	ServerResponse,
} from "@package/api-client";
import type { ApiErrorCode } from "@/types";

export interface MeQueryOrganization {
	id: string;
	organizationId: string;
	joinedAt: string;
	organization: {
		id: string;
		name: string;
	};
}

export interface MeQueryData {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profile: string | null;
	lastOrgId: string | null;
	isEmailVerified: boolean;
	isOnboarded: boolean;
	theme: string | null;
	referralSource: string | null;
	createdAt: string;
	updatedAt: string;
	current_organization: string | null;
	organizations: MeQueryOrganization[];
}
export type MeQueryResponse = ServerResponse<MeQueryData>;

export type MeQueryAxiosResponse = ApiResponse<MeQueryData>;

export type MeQueryErrorResponse = APIError<ApiErrorCode>;
