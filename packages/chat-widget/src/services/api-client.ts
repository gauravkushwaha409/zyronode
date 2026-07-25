import { getConfig } from "@/config";
import { createApiClient } from "@package/api-client";

let _apiClient: ReturnType<typeof createApiClient> | null = null;

export function getApiClient() {
  if (!_apiClient) {
    _apiClient = createApiClient(getConfig().serverUrl + "/v1");
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
