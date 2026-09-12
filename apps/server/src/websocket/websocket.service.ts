import { Injectable, Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { SseKey } from "../sse/keys";

/**
 * Socket counterpart to SseService.
 * Owns the single socket.io Server instance (set from InboxGateway.afterInit)
 * and exposes room-based emit helpers. All socket emits for the visitor/widget
 * surface should go through here — callers never touch `server.to(...).emit`
 * directly (mirrors SseService.publish for SSE).
 */
@Injectable()
export class WebsocketService {
	private readonly logger = new Logger(WebsocketService.name);
	private server: Server | null = null;

	setServer(server: Server) {
		this.server = server;
	}

	emitToConversation(
		conversationId: string,
		event: string,
		data: Record<string, unknown>,
	) {
		if (!this.server) {
			this.logger.warn("Server not set, cannot emit event");
			return;
		}
		this.server.to(SseKey.conversation(conversationId)).emit(event, data);
	}

	emitToOrg(
		organizationId: string,
		event: string,
		data: Record<string, unknown>,
	) {
		if (!this.server) {
			this.logger.warn("Server not set, cannot emit event");
			return;
		}
		this.server.to(SseKey.org(organizationId)).emit(event, data);
	}
}
