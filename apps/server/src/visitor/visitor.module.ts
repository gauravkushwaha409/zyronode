import { Module } from "@nestjs/common";
import { CallsModule } from "../calls/calls.module";
import { InboxModule } from "../inbox/inbox.module";
import { MessageModule } from "../message/message.module";
import { SseModule } from "../sse/sse.module";
import { WidgetEventsModule } from "./events/widget-events.module";
import { VisitorController } from "./visitor.controller";
import { VisitorGateway } from "./visitor.gateway";
import { VisitorService } from "./visitor.service";
import { WidgetController } from "./widget.controller";

@Module({
	imports: [
		WidgetEventsModule,
		CallsModule,
		InboxModule,
		MessageModule,
		SseModule,
	],
	controllers: [VisitorController, WidgetController],
	providers: [VisitorService, VisitorGateway],
	exports: [VisitorService],
})
export class VisitorModule {}
