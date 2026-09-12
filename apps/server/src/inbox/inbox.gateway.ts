import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { resolveSocketUser } from "../common/auth/socket-user";
import { getCorsOrigins } from "../common/cors";
import { MessageService } from "../message/message.service";
import { SseKey } from "../sse/keys";
import { WidgetEventsPublisher } from "../visitor/events/widget-events.publisher";
import { WebsocketService } from "../websocket/websocket.service";
import { ConversationService } from "./conversation.service";

interface SendMessagePayload {
	conversationId: string;
	content: string;
	messageType?: "TEXT" | "FILE" | "INTERNAL_NOTE";
	replyToId?: string;
}

interface TypingPayload {
	conversationId: string;
}

@WebSocketGateway({
	namespace: "/agent-inbox",
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
export class InboxGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(InboxGateway.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly messageService: MessageService,
		private readonly conversationService: ConversationService,
		private readonly websocketService: WebsocketService,
		private readonly widgetEvents: WidgetEventsPublisher,
	) {}

	afterInit() {
		this.websocketService.setServer(this.server);
	}

	async handleConnection(client: Socket) {
		try {
			client.data.user = await resolveSocketUser(this.jwtService, client);
			const user = client.data.user;
			if (user?.type === "AGENT") {
				this.logger.log(`Agent connected: ${user.id} (${client.id})`);
			} else {
				this.logger.log(`Visitor connected: ${client.id}`);
			}
		} catch (err) {
			this.logger.error(`Connection error: ${err}`);
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage("conversation:join")
	async handleConversationJoin(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { conversationId: string },
	) {
		const room = SseKey.conversation(data.conversationId);
		client.join(room);
		this.logger.log(`Client ${client.id} joined room ${room}`);
		return {
			event: "conversation:joined",
			data: { conversationId: data.conversationId },
		};
	}

	@SubscribeMessage("agent:join")
	async handleAgentJoin(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { organizationId: string },
	) {
		const user = client.data.user;
		if (user?.type !== "AGENT") {
			return { event: "error", data: { message: "Unauthorized" } };
		}

		const room = SseKey.org(data.organizationId);
		client.join(room);
		this.logger.log(`Agent ${user.id} joined org room ${room}`);
		return {
			event: "agent:joined",
			data: { organizationId: data.organizationId },
		};
	}

	@SubscribeMessage("message:send")
	async handleMessageSend(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: SendMessagePayload,
	) {
		const user = client.data.user;
		const senderType = user?.type ?? "VISITOR";
		const senderId = user?.type === "AGENT" ? user.id : undefined;

		const result = await this.messageService.create(
			data.conversationId,
			{
				content: data.content,
				messageType: data.messageType ?? "TEXT",
				replyToId: data.replyToId,
			},
			senderType,
			senderId,
		);

		await this.widgetEvents.messageCreated({
			conversationId: data.conversationId,
			message: result.data,
		});

		return { event: "message:sent", data: result.data };
	}

	@SubscribeMessage("typing:start")
	handleTypingStart(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: TypingPayload,
	) {
		const user = client.data.user;
		// Centralized typing — still direct to room for low latency, but via publisher
		void this.widgetEvents.typingUpdate({
			conversationId: data.conversationId,
			senderType: user?.type ?? "VISITOR",
			isTyping: true,
		});
		// Keep original room broadcast for immediate echo (publisher does same)
		client.to(SseKey.conversation(data.conversationId)).emit("typing:update", {
			conversationId: data.conversationId,
			senderType: user?.type ?? "VISITOR",
			isTyping: true,
		});
	}

	@SubscribeMessage("typing:stop")
	handleTypingStop(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: TypingPayload,
	) {
		const user = client.data.user;
		void this.widgetEvents.typingUpdate({
			conversationId: data.conversationId,
			senderType: user?.type ?? "VISITOR",
			isTyping: false,
		});
		client.to(SseKey.conversation(data.conversationId)).emit("typing:update", {
			conversationId: data.conversationId,
			senderType: user?.type ?? "VISITOR",
			isTyping: false,
		});
	}

	@SubscribeMessage("conversation:status")
	async handleConversationStatus(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { conversationId: string; status: string },
	) {
		const user = client.data.user;
		if (user?.type !== "AGENT") {
			return { event: "error", data: { message: "Unauthorized" } };
		}

		const result = await this.conversationService.updateStatus(
			data.conversationId,
			data.status as "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
		);

		await this.widgetEvents.conversationUpdated({
			conversationId: data.conversationId,
			organizationId:
				(result.data as unknown as { organizationId?: string })?.organizationId ??
				null,
			conversation: result.data,
		});

		return { event: "conversation:status:updated", data: result.data };
	}
}
