import {
	type ApiResponse,
	type AxiosRequestConfig,
	BaseAPIService,
} from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type { CursorPaginationParams } from "@/types/cursor-pagination.types";
import type {
	ConversationTypes,
	InternalNoteTypes,
	MessageTypes,
	UploadTypes,
} from "../types/inbox-api.types";

export type InboxConversationsFilters = {
	status?: string;
	search?: string;
} & CursorPaginationParams;

class InboxApiService extends BaseAPIService {
	async getConversations(
		organizationId: string,
		filters?: InboxConversationsFilters,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<ConversationTypes.InboxConversationsData>(
			CONFIG.ENDPOINTS.INBOX.CONVERSATIONS,
			{
				params: {
					organizationId,
					...filters,
				},
				...axiosConfiguration,
			},
		);
	}

	async getConversationDetail(
		conversationId: string,
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<ConversationTypes.InboxConversationDetail>(
			`${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}`,
			{
				params: { organizationId },
				...axiosConfiguration,
			},
		);
	}

	async createConversation(
		payload: ConversationTypes.CreateConversationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			{ id: string },
			ApiResponse<{ id: string }>,
			ConversationTypes.CreateConversationPayload
		>(CONFIG.ENDPOINTS.INBOX.CREATE_CONVERSATION, payload, axiosConfiguration);
	}

	async sendAgentMessage(
		conversationId: string,
		payload: MessageTypes.InboxSendAgentMessagePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<MessageTypes.InboxMessage>(
			`${CONFIG.ENDPOINTS.INBOX.SEND_MESSAGE}/${conversationId}/messages`,
			payload,
			axiosConfiguration,
		);
	}

	async uploadFile(
		conversationId: string,
		organizationId: string,
		file: File,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const formData = new FormData();
		formData.append("organizationId", organizationId);
		formData.append("file", file);
		return super.post<UploadTypes.InboxUploadedFile>(
			CONFIG.ENDPOINTS.INBOX.UPLOAD(conversationId),
			formData,
			{
				...axiosConfiguration,
				// instance default is Content-Type: application/json — override to
				// undefined so axios/the browser sets multipart/form-data with the
				// correct boundary itself instead of sending FormData as JSON.
				headers: { ...axiosConfiguration?.headers, "Content-Type": undefined },
			},
		);
	}

	async editMessage(
		conversationId: string,
		messageId: string,
		payload: MessageTypes.InboxEditMessagePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		// `patch`/`delete` on BaseAPIService aren't generically typed over the
		// response (unlike `get`/`post`) — cast to the real envelope shape.
		return super.patch<MessageTypes.InboxEditMessagePayload>(
			CONFIG.ENDPOINTS.INBOX.MESSAGE(conversationId, messageId),
			payload,
			axiosConfiguration,
		) as Promise<ApiResponse<MessageTypes.InboxMessage>>;
	}

	async deleteMessage(
		conversationId: string,
		messageId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.delete<{ message: string }>(
			CONFIG.ENDPOINTS.INBOX.MESSAGE(conversationId, messageId),
			axiosConfiguration,
		) as Promise<ApiResponse<{ message: string }>>;
	}

	async createInternalNote(
		conversationId: string,
		organizationId: string,
		payload: InternalNoteTypes.InboxCreateInternalNotePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<MessageTypes.InboxMessage>(
			CONFIG.ENDPOINTS.INBOX.INTERNAL_NOTES(conversationId),
			payload,
			{
				params: { organizationId },
				...axiosConfiguration,
			},
		);
	}

	async closeConversation(
		conversationId: string,
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<{ id: string; status: string }>(
			`${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}/close`,
			{ organizationId },
			axiosConfiguration,
		);
	}

	async reopenConversation(
		conversationId: string,
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<{ id: string; status: string }>(
			`${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}/reopen`,
			{ organizationId },
			axiosConfiguration,
		);
	}

	async markAsRead(
		conversationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<{ message: string }>(
			`${CONFIG.ENDPOINTS.INBOX.MARK_READ}/${conversationId}/messages/read`,
			undefined,
			axiosConfiguration,
		);
	}

	async softDeleteConversation(
		conversationId: string,
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.delete<{ id: string }>(
			`${CONFIG.ENDPOINTS.INBOX.CONVERSATION}/${conversationId}`,
			{
				params: { organizationId },
				...axiosConfiguration,
			},
		);
	}

	async unreadStats(axiosConfiguration?: AxiosRequestConfig) {
		return super.get<{ conversations_with_unread: number; total_unread: number }>(
			CONFIG.ENDPOINTS.INBOX.UNREAD_STATS,
			axiosConfiguration,
		);
	}

	async getMessages(
		conversationId: string,
		filters?: CursorPaginationParams,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<{
			messages: MessageTypes.InboxMessage[];
			pagination: import("@/types/cursor-pagination.types").CursorPaginationMeta;
		}>(CONFIG.ENDPOINTS.INBOX.MESSAGES(conversationId), {
			params: { ...filters },
			...axiosConfiguration,
		});
	}
}

export const inboxApiService = new InboxApiService(apiClient);
