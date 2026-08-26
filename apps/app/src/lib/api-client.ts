import { createApiClient } from "@package/api-client";

export const apiClient = createApiClient(
	__PROXY_ENABLED__ ? "/api/v1" : `${__SERVER_URL__}/api/v1`,
);

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
