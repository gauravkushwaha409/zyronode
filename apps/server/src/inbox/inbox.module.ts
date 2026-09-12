import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MessageModule } from "../message/message.module";
import { AgentVisitorsGateway } from "./agent-visitors.gateway";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";
import { InboxController } from "./inbox.controller";
import { InboxGateway } from "./inbox.gateway";
import { InboxService } from "./inbox.service";
import { WidgetEventsModule } from "../visitor/events/widget-events.module";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
		MessageModule,
		WidgetEventsModule,
	],
	controllers: [InboxController, ConversationController],
	providers: [InboxService, ConversationService, InboxGateway, AgentVisitorsGateway],
	exports: [ConversationService, InboxService],
})
export class InboxModule {}
