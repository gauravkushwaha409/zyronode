import { BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";

class NotificationsApiService extends BaseAPIService {
	async registerToken(payload: { token: string }) {
		return super.post<{ id: string }>(
			CONFIG.ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN,
			payload,
		);
	}

	async removeToken(token: string) {
		return super.delete<null>(CONFIG.ENDPOINTS.NOTIFICATIONS.REMOVE_TOKEN(token));
	}
}

export const notificationsApiService = new NotificationsApiService(apiClient);
