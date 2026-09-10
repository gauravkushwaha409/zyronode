import { Module } from "@nestjs/common";
import { WidgetEventsModule } from "../visitor/events/widget-events.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Module({
	imports: [WidgetEventsModule],
	controllers: [MessageController],
	providers: [MessageService],
	exports: [MessageService],
})
export class MessageModule {}
