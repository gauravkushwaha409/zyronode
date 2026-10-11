import { BaseAPIService } from "@package/api-client";
import type { IceServersResponse } from "@package/call-signaling";
import { CHAT_WIDGET_API } from "../../config";
import { getApiClient } from "../../services/api-client";

class VisitorCallApiService extends BaseAPIService {
	async getCallToken(organizationId: string, conversationId: string) {
		return super.post<{ token: string; visitorId: string; expiresIn: number }>(
			CHAT_WIDGET_API.CALL_TOKEN,
			{ organizationId, conversationId },
		);
	}

	async getIceServers(organizationId: string) {
		return super.get<IceServersResponse>(
			CHAT_WIDGET_API.CALL_ICE_SERVERS(organizationId),
		);
	}
}

let _visitorCallApi: VisitorCallApiService | null = null;

export function getVisitorCallApi() {
	if (!_visitorCallApi) {
		_visitorCallApi = new VisitorCallApiService(getApiClient());
	}
	return _visitorCallApi;
}
