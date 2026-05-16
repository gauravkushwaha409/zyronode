import { createApiClient } from "@package/api-client";

// export const apiClient = createApiClient(import.meta.env.VITE_SERVER_URL);
export const apiClient = createApiClient('/api');

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - redirecting to login");
    }
    return Promise.reject(error);
  }
);