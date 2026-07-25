import { createApiClient } from "@package/api-client";

// export const apiClient = createApiClient(import.meta.env.VITE_SERVER_URL);
export const apiClient = createApiClient("/v1");

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
