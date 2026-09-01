import { BaseAPIService } from "@package/api-client";
import { CHAT_WIDGET_API } from "../config";
import type {
	ChatMessage,
	ConversationData,
	CreateConversationAxiosResponse,
	CreateConversationPayload,
	GetMessagesAxiosResponse,
	MessagesData,
	SendMessageAxiosResponse,
	SendMessagePayload,
} from "../types";
import { getApiClient } from "./api-client";

export class WidgetApiService extends BaseAPIService {
	async createConversation(payload: CreateConversationPayload) {
		return super.post<ConversationData, CreateConversationAxiosResponse>(
			CHAT_WIDGET_API.CONVERSATIONS,
			payload,
		);
	}

	async getMessages(conversationId: string, page = 1, limit = 50) {
		return super.get<MessagesData, GetMessagesAxiosResponse>(
			`${CHAT_WIDGET_API.CONVERSATION_MESSAGES(conversationId)}?page=${page}&limit=${limit}`,
		);
	}

	async sendVisitorMessage(conversationId: string, payload: SendMessagePayload) {
		return super.post<ChatMessage, SendMessageAxiosResponse>(
			CHAT_WIDGET_API.CONVERSATION_VISITOR_MESSAGES(conversationId),
			payload,
		);
	}
}

let _widgetApi: WidgetApiService | null = null;

export function getWidgetApi() {
	if (!_widgetApi) {
		_widgetApi = new WidgetApiService(getApiClient());
	}
	return _widgetApi;
}
