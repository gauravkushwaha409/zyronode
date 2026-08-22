import { Module } from "@nestjs/common";
import { SseModule } from "../sse/sse.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Module({
	imports: [SseModule],
	controllers: [MessageController],
	providers: [MessageService],
	exports: [MessageService],
})
export class MessageModule {}
