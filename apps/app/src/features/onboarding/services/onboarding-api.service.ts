import {
	type AxiosRequestConfig,
	BaseAPIService,
} from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
	OrganizationOnboardingMutation,
	UserOnboardingMutation,
} from "../types";

class OnboardingApiService extends BaseAPIService {
	async userOnboarding(
		data: UserOnboardingMutation.UserOnboardingMutationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			UserOnboardingMutation.UserOnboardingData,
			UserOnboardingMutation.UserOnboardingMutationAxiosResponse,
			UserOnboardingMutation.UserOnboardingMutationPayload
		>(CONFIG.ENDPOINTS.AUTH.USER_ONBOARDING, data, axiosConfiguration);
	}

	async organizationOnboarding(
		data: OrganizationOnboardingMutation.OrganizationOnboardingMutationPayload,
		axiosConfig?: AxiosRequestConfig,
	) {
		return super.post<
			OrganizationOnboardingMutation.OrganizationOnboardingData,
			OrganizationOnboardingMutation.OrganizationOnboardingMutationAxiosResponse,
			OrganizationOnboardingMutation.OrganizationOnboardingMutationPayload
		>(CONFIG.ENDPOINTS.ORGANIZATION.CREATE, data, axiosConfig);
	}
}

export const onboardingApiService = new OnboardingApiService(apiClient);
