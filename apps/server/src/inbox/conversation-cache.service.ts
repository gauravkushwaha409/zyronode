import { Injectable, Logger } from "@nestjs/common";
import { RedisKey } from "../redis/redis.keys";
import { RedisService } from "../redis/redis.service";
import type { ConversationDetailDto } from "./conversation-detail.types";

const CONVERSATION_DETAIL_TTL_SECONDS = 60;

/** Redis-only conversation cache adapter. Never queries Prisma. */
@Injectable()
export class ConversationCacheService {
	private readonly logger = new Logger(ConversationCacheService.name);

	constructor(private readonly redis: RedisService) {}

	async getDetail(
		organizationId: string,
		conversationId: string,
	): Promise<ConversationDetailDto | null> {
		try {
			const value = await this.redis.get(
				RedisKey.conversationDetail(organizationId, conversationId),
			);
			return value ? (JSON.parse(value) as ConversationDetailDto) : null;
		} catch (err) {
			this.logger.warn(
				`Conversation detail cache read failed: ${(err as Error).message}`,
			);
			return null;
		}
	}

	async setDetail(
		organizationId: string,
		conversationId: string,
		detail: ConversationDetailDto,
	): Promise<void> {
		try {
			await this.redis.set(
				RedisKey.conversationDetail(organizationId, conversationId),
				JSON.stringify(detail),
				CONVERSATION_DETAIL_TTL_SECONDS,
			);
		} catch (err) {
			this.logger.warn(
				`Conversation detail cache write failed: ${(err as Error).message}`,
			);
		}
	}

	async deleteDetail(
		organizationId: string,
		conversationId: string,
	): Promise<void> {
		try {
			await this.redis.del(
				RedisKey.conversationDetail(organizationId, conversationId),
			);
		} catch (err) {
			this.logger.warn(
				`Conversation detail cache invalidation failed: ${(err as Error).message}`,
			);
		}
	}
}
