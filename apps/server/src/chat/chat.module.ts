import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConversationModule } from "../conversation/conversation.module";
import { MessageModule } from "../message/message.module";
import { SseModule } from "../sse/sse.module";
import { ChatGateway } from "./chat.gateway";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
		ConversationModule,
		MessageModule,
		SseModule,
	],
	providers: [ChatGateway],
	exports: [ChatGateway],
})
export class ChatModule {}
