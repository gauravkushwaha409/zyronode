import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConversationModule } from "../conversation/conversation.module";
import { MessageModule } from "../message/message.module";
import { SseModule } from "../sse/sse.module";
import { AgentGateway } from "./agent.gateway";
import { InboxController } from "./inbox.controller";
import { InboxGateway } from "./inbox.gateway";
import { InboxService } from "./inbox.service";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
		ConversationModule,
		MessageModule,
		SseModule,
	],
	controllers: [InboxController],
	providers: [InboxService, InboxGateway, AgentGateway],
})
export class InboxModule {}
