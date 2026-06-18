import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type { OrganizationList, OrganizationMutation } from "../types";

class OrganizationApiServices extends BaseAPIService {
	async create(
		data: OrganizationMutation.CreateOrganizationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			OrganizationMutation.OrganizationResponseData,
			OrganizationMutation.OrganizationMutationAxiosResponse
		>(CONFIG.ENDPOINTS.ORGANIZATION.CREATE, data, axiosConfiguration);
	}

	async getMyOrganizations(axiosConfiguration?: AxiosRequestConfig) {
		return super.get<
			OrganizationList.OrganizationItem[],
			OrganizationList.OrganizationListAxiosResponse
		>(CONFIG.ENDPOINTS.ORGANIZATION.GET_MY, axiosConfiguration);
	}
}

export const organizationApiService = new OrganizationApiServices(apiClient);
