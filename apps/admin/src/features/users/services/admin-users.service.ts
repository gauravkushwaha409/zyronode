import { BaseAPIService } from "@package/api-client";
import { ADMIN_ENDPOINTS } from "@/config/admin-api";
import { apiClient } from "@/lib/api-client";
import type {
	AdminUserListData,
	AdminUserListParams,
	AdminUserListResponse,
} from "../types";

class AdminUsersService extends BaseAPIService {
	list(params: AdminUserListParams) {
		return super.get<AdminUserListData, AdminUserListResponse>(
			ADMIN_ENDPOINTS.USERS.LIST,
			{ params },
		);
	}
}

export const adminUsersService = new AdminUsersService(apiClient);
