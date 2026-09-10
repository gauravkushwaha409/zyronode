import { Module } from "@nestjs/common";
import { SseModule } from "../../sse/sse.module";
import { WebsocketModule } from "../../websocket/websocket.module";
import { WidgetEventsPublisher } from "./widget-events.publisher";

/**
 * Leaf module — owns the centralized visitor/widget realtime publisher.
 * Imports SseModule + WebsocketModule (mirrors SSE/WS symmetry) — no
 * dependency on Conversation/Message/Visitor services, so MessageModule,
 * InboxModule, VisitorModule can all import this without circularity.
 */
@Module({
	imports: [WebsocketModule, SseModule],
	providers: [WidgetEventsPublisher],
	exports: [WidgetEventsPublisher],
})
export class WidgetEventsModule {}
