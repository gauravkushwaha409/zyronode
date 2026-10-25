import { Injectable, NotFoundException } from "@nestjs/common";
import { ConversationCacheService } from "./conversation-cache.service";
import type {
	ConversationDetailDto,
	ConversationDetailMessageDto,
} from "./conversation-detail.types";
import {
	type ConversationDetailRecord,
	ConversationRepository,
} from "./conversation.repository";

const DETAIL_FETCHED_MESSAGE = "Conversation details fetched successfully";

function toConversationDetailDto(
	record: ConversationDetailRecord,
): ConversationDetailDto {
	return {
		...record,
		deletedAt: record.deletedAt?.toISOString() ?? null,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
		messages: record.messages.map(
			(message): ConversationDetailMessageDto => ({
				id: message.id,
				conversationId: message.conversationId,
				senderType: message.senderType,
				senderId: message.senderId,
				messageType: message.messageType,
				content: message.content,
				replyToId: message.replyToId,
				status: message.status,
				isEdited: message.isEdited,
				editedAt: message.editedAt?.toISOString() ?? null,
				deletedAt: message.deletedAt?.toISOString() ?? null,
				createdAt: message.createdAt.toISOString(),
				updatedAt: message.updatedAt.toISOString(),
				replyTo: message.replyTo,
			}),
		),
	};
}

/** Cache-aside orchestrator: Redis first, Prisma on miss, then fill the cache. */
@Injectable()
export class ConversationReadService {
	constructor(
		private readonly repository: ConversationRepository,
		private readonly cache: ConversationCacheService,
	) {}

	async getConversationDetails(organizationId: string, conversationId: string) {
		const cached = await this.cache.getDetail(organizationId, conversationId);
		if (cached) {
			return { message: DETAIL_FETCHED_MESSAGE, data: cached };
		}

		const record = await this.repository.findDetail(
			organizationId,
			conversationId,
		);
		if (!record) {
			throw new NotFoundException("Conversation not found");
		}

		const data = toConversationDetailDto(record);
		await this.cache.setDetail(organizationId, conversationId, data);

		return { message: DETAIL_FETCHED_MESSAGE, data };
	}
}
