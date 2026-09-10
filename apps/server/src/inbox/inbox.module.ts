import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConversationModule } from "../conversation/conversation.module";
import { MessageModule } from "../message/message.module";
import { AgentVisitorsGateway } from "./agent-visitors.gateway";
import { InboxController } from "./inbox.controller";
import { InboxGateway } from "./inbox.gateway";
import { InboxService } from "./inbox.service";
import { WidgetEventsModule } from "../visitor/events/widget-events.module";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
		ConversationModule,
		MessageModule,
		WidgetEventsModule,
	],
	controllers: [InboxController],
	providers: [InboxService, InboxGateway, AgentVisitorsGateway],
})
export class InboxModule {}
