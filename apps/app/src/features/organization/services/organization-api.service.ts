import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
	OrganizationList,
	OrganizationMembers,
	OrganizationMutation,
	SwitchOrganizationMutation,
} from "../types";

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

	async switchOrganization(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			SwitchOrganizationMutation.SwitchOrganizationResponseData,
			SwitchOrganizationMutation.SwitchOrganizationAxiosResponse,
			{ organizationId: string }
		>(
			CONFIG.ENDPOINTS.ORGANIZATION.SWITCH,
			{ organizationId },
			axiosConfiguration,
		);
	}

	async getMyOrganizations(axiosConfiguration?: AxiosRequestConfig) {
		return super.get<
			OrganizationList.OrganizationItem[],
			OrganizationList.OrganizationListAxiosResponse
		>(CONFIG.ENDPOINTS.ORGANIZATION.GET_MY, axiosConfiguration);
	}

	async getMembers(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<
			OrganizationMembers.OrganizationMemberItem[],
			OrganizationMembers.OrganizationMembersAxiosResponse
		>(CONFIG.ENDPOINTS.ORGANIZATION.MEMBERS(organizationId), axiosConfiguration);
	}
}

export const organizationApiService = new OrganizationApiServices(apiClient);
