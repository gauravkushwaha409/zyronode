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
import { EventBridge } from "../common/services/event-bridge.service";
import { ConversationService } from "../conversation/conversation.service";
import { MessageService } from "../message/message.service";
import { SseService } from "../sse/sse.service";

interface AuthPayload {
	id: string;
}

interface SendMessagePayload {
	conversationId: string;
	content: string;
	messageType?: "TEXT" | "FILE" | "INTERNAL_NOTE";
	replyToId?: string;
}

interface TypingPayload {
	conversationId: string;
}

function getCorsOrigins(): string[] {
	const appPort = process.env.APP_PORT ?? "3000";
	const chatWidgetPort = process.env.CHAT_WIDGET_PORT ?? "4000";
	const origins = new Set<string>([
		`http://localhost:${appPort}`,
		`http://localhost:${chatWidgetPort}`,
		"http://localhost:4001",
	]);
	const viteAppUrl = process.env.VITE_APP_URL?.replace(/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g, (_, b, c) => process.env[b ?? c] ?? "");
	if (viteAppUrl) {
		try {
			origins.add(new URL(viteAppUrl).origin);
		} catch {}
	}
	if (process.env.CORS_ORIGINS) {
		for (const o of process.env.CORS_ORIGINS.split(",")) {
			const t = o.trim();
			if (t) origins.add(t);
		}
	}
	return [...origins];
}

@WebSocketGateway({
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(ChatGateway.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly messageService: MessageService,
		private readonly conversationService: ConversationService,
		private readonly eventBridge: EventBridge,
		private readonly sseService: SseService,
	) {}

	afterInit() {
		this.eventBridge.setServer(this.server);
	}

	async handleConnection(client: Socket) {
		try {
			const token =
				client.handshake.auth?.token ??
				client.handshake.headers?.authorization?.replace("Bearer ", "");

			if (token) {
				try {
					const payload = await this.jwtService.verifyAsync<AuthPayload>(token);
					client.data.user = { id: payload.id, type: "AGENT" as const };
					this.logger.log(`Agent connected: ${payload.id} (${client.id})`);
				} catch {
					client.data.user = { type: "VISITOR" as const };
					this.logger.log(`Visitor connected (no valid token): ${client.id}`);
				}
			} else {
				client.data.user = { type: "VISITOR" as const };
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
		const room = `conversation:${data.conversationId}`;
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

		const room = `org:${data.organizationId}`;
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

		const room = `conversation:${data.conversationId}`;
		this.server.to(room).emit("message:new", {
			conversation: { id: data.conversationId },
			message: result.data,
		});

		const conversation = await this.conversationService.findById(
			data.conversationId,
		);
		if (conversation.data?.organizationId) {
			this.server
				.to(`org:${conversation.data.organizationId}`)
				.emit("message:new", {
					conversation: conversation.data,
					message: result.data,
				});

			void this.sseService.publish(
				[
					`org:${conversation.data.organizationId}`,
					`conversation:${data.conversationId}`,
				],
				"message.created",
				{ conversation: { id: data.conversationId }, message: result.data },
			);
		}

		return { event: "message:sent", data: result.data };
	}

	@SubscribeMessage("typing:start")
	handleTypingStart(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: TypingPayload,
	) {
		const user = client.data.user;
		const room = `conversation:${data.conversationId}`;
		client.to(room).emit("typing:update", {
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
		const room = `conversation:${data.conversationId}`;
		client.to(room).emit("typing:update", {
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

		const room = `conversation:${data.conversationId}`;
		this.server
			.to(room)
			.emit("conversation:updated", { conversation: result.data });

		if (result.data?.organizationId) {
			this.server
				.to(`org:${result.data.organizationId}`)
				.emit("conversation:updated", { conversation: result.data });
		}

		return { event: "conversation:status:updated", data: result.data };
	}
}
