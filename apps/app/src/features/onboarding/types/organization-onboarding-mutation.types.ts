import type { APIError, ApiResponse, ServerResponse } from "@package/api-client";
import type { FieldError } from "@package/form";
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

export type OrganizationOnboardingErrorResponse = APIError<
	FieldError<OrganizationOnboardingSchema>
>;
