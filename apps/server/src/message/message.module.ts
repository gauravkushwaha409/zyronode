import { Module } from "@nestjs/common";
import { ConversationCacheModule } from "../inbox/conversation-cache.module";
import { WidgetEventsModule } from "../visitor/events/widget-events.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Module({
	imports: [WidgetEventsModule, ConversationCacheModule],
	controllers: [MessageController],
	providers: [MessageService],
	exports: [MessageService],
})
export class MessageModule {}
