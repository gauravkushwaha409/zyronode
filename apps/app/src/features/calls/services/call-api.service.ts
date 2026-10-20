import { BaseAPIService } from "@package/api-client";
import type {
	CallHistoryItem,
	IceServersResponse,
} from "@package/call-signaling";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";

class CallApiService extends BaseAPIService {
	async getIceServers() {
		return super.get<IceServersResponse>(CONFIG.ENDPOINTS.CALLS.ICE_SERVERS);
	}

	async getCallHistory(conversationId: string, cursor?: string, limit = 20) {
		return super.get<{
			items: CallHistoryItem[];
			nextCursor: string | null;
		}>(CONFIG.ENDPOINTS.CALLS.HISTORY, {
			params: { conversationId, cursor, limit },
		});
	}
}

export const callApiService = new CallApiService(apiClient);
