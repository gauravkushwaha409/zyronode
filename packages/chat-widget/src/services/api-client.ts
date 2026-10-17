import { createApiClient } from "@package/api-client";
import { getChatWidgetConfig } from "@/config";

let _apiClient: ReturnType<typeof createApiClient> | null = null;

export function getApiClient() {
	if (!_apiClient) {
		_apiClient = createApiClient(
			`${getChatWidgetConfig().serverUrl}/api/v1`,
		);
		_apiClient.interceptors.request.use((config) => {
			return config;
		});
		_apiClient.interceptors.response.use(
			(response) => response,
			(error) => {
				return Promise.reject(error);
			},
		);
	}
	return _apiClient;
}
