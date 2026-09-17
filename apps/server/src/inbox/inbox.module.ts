import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MessageModule } from "../message/message.module";
import { SseModule } from "../sse/sse.module";
import { WidgetEventsModule } from "../visitor/events/widget-events.module";
import { AgentVisitorsGateway } from "./agent-visitors.gateway";
import { ConversationService } from "./conversation.service";
import { InboxController } from "./inbox.controller";
import { InboxGateway } from "./inbox.gateway";
import { InboxService } from "./inbox.service";
import { InboxSsePublisher } from "./inbox-sse.publisher";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
		MessageModule,
		WidgetEventsModule,
		SseModule,
	],
	controllers: [InboxController],
	providers: [
		InboxService,
		ConversationService,
		InboxGateway,
		AgentVisitorsGateway,
		InboxSsePublisher,
	],
	exports: [ConversationService, InboxService, InboxSsePublisher],
})
export class InboxModule {}
