import type {
	APIError,
	ApiResponse,
	ServerResponse,
} from "@package/api-client";
import type { ApiErrorCode } from "@/types";

export interface MeQueryData {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	profile: null;
	lastOrgId: null;
	isEmailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	current_organization: string | null;
}
export type MeQueryResponse = ServerResponse<MeQueryData>;

export type MeQueryAxiosResponse = ApiResponse<MeQueryData>;

export type MeQueryErrorResponse = APIError<ApiErrorCode>;
