import { createApiClient } from "@package/api-client";

export const API_BASE_URL = __PROXY_ENABLED__
	? "/api/v1"
	: `${__SERVER_URL__}/api/v1`;

export const apiClient = createApiClient(API_BASE_URL);
