import { Module } from "@nestjs/common";
import { createObserveModule } from "@nestjs/observe";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { CommonModule } from "./common/common.module";
import { ConversationModule } from "./conversation/conversation.module";
import { InboxModule } from "./inbox/inbox.module";
import { MessageModule } from "./message/message.module";
import { OrganizationModule } from "./organization/organization.module";
import { OtpModule } from "./otp/otp.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { SseModule } from "./sse/sse.module";
import { VisitorModule } from "./visitor/visitor.module";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
	imports: [
		CommonModule,
		PrismaModule,
		RedisModule,
		AuthModule,
		OrganizationModule,
		OtpModule,
		ConversationModule,
		MessageModule,
		ChatModule,
		InboxModule,
		SseModule,
		VisitorModule,
		ObserveModule.forRoot({
			appKey: process.env.OBSERVE_APP_KEY ?? "default",
			appSecret: process.env.OBSERVE_APP_SECRET ?? "default",
			serviceId: "server",
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
