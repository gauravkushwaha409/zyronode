import type { ApiResponse, ServerResponse } from "@package/api-client";

export interface UserOnboardingMutationPayload {
	firstName: string;
	lastName: string;
	theme: "light" | "dark";
	referralSource: string;
}

export interface UserOnboardingData {
	id: string;
}

export type UserOnboardingMutationResponse =
	ServerResponse<UserOnboardingData>;

export type UserOnboardingMutationAxiosResponse =
	ApiResponse<UserOnboardingData>;
