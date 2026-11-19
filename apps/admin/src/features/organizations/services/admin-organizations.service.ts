import { BaseAPIService } from "@package/api-client";
import { ADMIN_ENDPOINTS } from "@/config/admin-api";
import { apiClient } from "@/lib/api-client";
import type {
	AdminOrganizationListData,
	AdminOrganizationListParams,
	AdminOrganizationListResponse,
} from "../types";

class AdminOrganizationsService extends BaseAPIService {
	list(params: AdminOrganizationListParams) {
		return super.get<AdminOrganizationListData, AdminOrganizationListResponse>(
			ADMIN_ENDPOINTS.ORGANIZATIONS.LIST,
			{ params },
		);
	}
}

export const adminOrganizationsService = new AdminOrganizationsService(
	apiClient,
);
