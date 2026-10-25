import { Module } from "@nestjs/common";
import { ConversationCacheService } from "./conversation-cache.service";

@Module({
	providers: [ConversationCacheService],
	exports: [ConversationCacheService],
})
export class ConversationCacheModule {}
