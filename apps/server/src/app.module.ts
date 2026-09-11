import { Module } from "@nestjs/common";
import { createObserveModule } from "@nestjs/observe";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ConversationModule } from "./conversation/conversation.module";
import { InboxModule } from "./inbox/inbox.module";
import { MessageModule } from "./message/message.module";
import { OrganizationModule } from "./organization/organization.module";
import { OtpModule } from "./otp/otp.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { RoleModule } from "./role/role.module";
import { SseModule } from "./sse/sse.module";
import { TeamModule } from "./team/team.module";
import { VisitorModule } from "./visitor/visitor.module";
import { WebsocketModule } from "./websocket/websocket.module";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

// docker compose interpolates $VAR in env_file, so .env stores $$ to mean literal $. Normalize for both `pnpm dev` (dotenv) and docker.
const normalizeObserveValue = (v?: string) => v?.replace(/\$\$/g, "$");
const observeAppKey = normalizeObserveValue(process.env.OBSERVE_APP_KEY);
const observeAppSecret = normalizeObserveValue(process.env.OBSERVE_APP_SECRET);

const hasObserveCreds = !!observeAppKey && !!observeAppSecret;
@Module({
	imports: [
		WebsocketModule,
		PrismaModule,
		RedisModule,
		AuthModule,
		OrganizationModule,
		OtpModule,
		ConversationModule,
		MessageModule,
		InboxModule,
		RoleModule,
		SseModule,
		TeamModule,
		VisitorModule,
		...(hasObserveCreds
			? [
					ObserveModule.forRoot({
						appKey: observeAppKey as string,
						appSecret: observeAppSecret as string,
						serviceId: "zyro-chat-server",
					}),
				]
			: []),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
