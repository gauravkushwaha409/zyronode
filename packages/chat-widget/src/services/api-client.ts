import { getConfig } from "@/config";
import { createApiClient } from "@package/api-client";

export const apiClient = createApiClient(getConfig().serverUrl + "/v1");

apiClient.interceptors.request.use((config) => {
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
