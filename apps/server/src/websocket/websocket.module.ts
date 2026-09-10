import { Global, Module } from "@nestjs/common";
import { WebsocketService } from "./websocket.service";

/**
 * Dedicated socket module — mirrors SseModule.
 * Owns WebsocketService (socket.io Server wrapper) so all WS emits
 * live in one place. Global so gateways/publishers can inject without
 * importing everywhere.
 */
@Global()
@Module({
	providers: [WebsocketService],
	exports: [WebsocketService],
})
export class WebsocketModule {}
