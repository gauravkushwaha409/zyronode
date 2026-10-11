import { BaseAPIService } from "@package/api-client";
import type { IceServersResponse } from "@package/call-signaling";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";

class CallApiService extends BaseAPIService {
	async getIceServers() {
		return super.get<IceServersResponse>(CONFIG.ENDPOINTS.CALLS.ICE_SERVERS);
	}
}

export const callApiService = new CallApiService(apiClient);
