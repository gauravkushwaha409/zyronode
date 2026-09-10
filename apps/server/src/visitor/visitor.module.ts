import { Module } from "@nestjs/common";
import { ConversationModule } from "../conversation/conversation.module";
import { MessageModule } from "../message/message.module";
import { SseService } from "../sse/sse.service";
import { WidgetEventsModule } from "./events/widget-events.module";
import { VisitorController } from "./visitor.controller";
import { VisitorGateway } from "./visitor.gateway";
import { VisitorService } from "./visitor.service";
import { WidgetController } from "./widget.controller";
import { WidgetSseController } from "./widget.sse";

@Module({
	imports: [WidgetEventsModule, ConversationModule, MessageModule],
	controllers: [VisitorController, WidgetController, WidgetSseController],
	providers: [VisitorService, VisitorGateway, SseService],
	exports: [VisitorService],
})
export class VisitorModule {}
