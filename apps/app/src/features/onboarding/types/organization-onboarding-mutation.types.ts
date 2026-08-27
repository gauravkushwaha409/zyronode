import type { APIError, ApiResponse, ServerResponse } from "@package/api-client";
import type { OrganizationOnboardingSchema } from "../schemas";

export interface OrganizationOnboardingMutationPayload {
	name: string;
	domain: string;
	description?: string;
	onboarding?: {
		size_range?: string;
		use_case?: string[];
		industry?: string;
		previous_tool?: string;
	};
	logo?: string;
}

export interface OrganizationOnboardingResponseData {
	id: string;
	name: string;
}

export type OrganizationOnboardingData =
	ServerResponse<OrganizationOnboardingResponseData>;

export type OrganizationOnboardingMutationAxiosResponse =
	ApiResponse<OrganizationOnboardingResponseData>;

/**
 * Per-field validation messages the backend returns under `errors`.
 * APIError's first parameter is the error CODE (must extend string), so the
 * field map belongs in the second (data) slot.
 */
export type OrganizationOnboardingFieldErrors = Partial<
	Record<keyof OrganizationOnboardingSchema, string[]>
>;

export type OrganizationOnboardingErrorResponse = APIError<
	string,
	OrganizationOnboardingFieldErrors
>;
