import { CONFIG } from "@/config";
import { BaseAPIService, type AxiosRequestConfig } from "@package/api-client";
import { apiClient } from "@/lib";
import type { CreateOrganizationTypes } from "../types";

class OrganizationApiServices extends BaseAPIService {
    async create(data: CreateOrganizationTypes.CreateOrganizationPayload, axiosConfiguration?: AxiosRequestConfig) {
        return super.post(CONFIG.ENDPOINTS.ORGANIZATION.CREATE, data, axiosConfiguration);
    }
}

export const organizationApiService = new OrganizationApiServices(apiClient);