import { Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { SseModule } from "../sse/sse.module";

@Module({
  imports: [SseModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
