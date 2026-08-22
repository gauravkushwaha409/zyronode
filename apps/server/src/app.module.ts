import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from './session/session.module';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';
import { InboxModule } from './inbox/inbox.module';
import { CommonModule } from './common/common.module';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    OrganizationModule,
    OtpModule,
    SessionModule,
    MessageModule,
    ChatModule,
    InboxModule,
    SseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
