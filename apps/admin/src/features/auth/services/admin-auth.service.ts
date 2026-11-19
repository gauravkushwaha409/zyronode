import { BaseAPIService } from "@package/api-client";
import { ADMIN_ENDPOINTS } from "@/config/admin-api";
import { apiClient } from "@/lib/api-client";
import type {
	AdminLoginPayload,
	AdminLoginResponse,
	AdminLogoutResponse,
	AdminMeResponse,
} from "../types";

class AdminAuthService extends BaseAPIService {
	login(payload: AdminLoginPayload) {
		return super.post<
			AdminLoginResponse["data"]["data"],
			AdminLoginResponse,
			AdminLoginPayload
		>(ADMIN_ENDPOINTS.AUTH.LOGIN, payload);
	}

	me() {
		return super.get<
			AdminMeResponse["data"]["data"],
			AdminMeResponse
		>(ADMIN_ENDPOINTS.AUTH.ME);
	}

	logout() {
		return super.post<null, AdminLogoutResponse>(
			ADMIN_ENDPOINTS.AUTH.LOGOUT,
		);
	}
}

export const adminAuthService = new AdminAuthService(apiClient);
