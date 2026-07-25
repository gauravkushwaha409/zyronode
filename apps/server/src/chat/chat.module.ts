import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ChatGateway } from "./chat.gateway";
import { SessionModule } from "../session/session.module";
import { MessageModule } from "../message/message.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    SessionModule,
    MessageModule,
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
