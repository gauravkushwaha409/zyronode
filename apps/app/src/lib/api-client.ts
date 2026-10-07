import { createApiClient } from "@package/api-client";

export const API_BASE_URL = __PROXY_ENABLED__
	? "/api/v1"
	: `${__SERVER_URL__}/api/v1`;

export const apiClient = createApiClient(API_BASE_URL);

apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error),
);
