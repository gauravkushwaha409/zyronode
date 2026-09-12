import { Module } from "@nestjs/common";
import { MessageModule } from "../message/message.module";
import { SseService } from "../sse/sse.service";
import { WidgetEventsModule } from "./events/widget-events.module";
import { VisitorController } from "./visitor.controller";
import { VisitorGateway } from "./visitor.gateway";
import { VisitorService } from "./visitor.service";
import { WidgetController } from "./widget.controller";
import { WidgetSseController } from "./widget.sse";
import { InboxModule } from "../inbox/inbox.module";

@Module({
	imports: [WidgetEventsModule, InboxModule, MessageModule],
	controllers: [VisitorController, WidgetController, WidgetSseController],
	providers: [VisitorService, VisitorGateway, SseService],
	exports: [VisitorService],
})
export class VisitorModule {}
