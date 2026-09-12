import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { resolveSocketUser } from "../common/auth/socket-user";
import { getCorsOrigins } from "../common/cors";
import { SseKey } from "../sse/keys";

/**
 * Agents operating on visitors (`/agent-visitors`): join, online/offline
 * presence for the agent-on-visitor-page surface.
 *
 * Owns `org:<id>` rooms on its own server instance for agent online/offline
 * fanout. Inbox delivery rooms live on the /agent-inbox server instead, so
 * each namespace joins only the rooms it emits to.
 */
@WebSocketGateway({
	namespace: "/agent-visitors",
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
export class AgentVisitorsGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(AgentVisitorsGateway.name);

	constructor(private readonly jwtService: JwtService) {}

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
		const orgIds: string[] = client.data.orgIds ?? [];
		if (!orgIds.includes(data.organizationId)) {
			orgIds.push(data.organizationId);
			client.data.orgIds = orgIds;
		}
		this.server.to(room).emit("agent:online", {
			agentId: user.id,
			organizationId: data.organizationId,
			at: new Date().toISOString(),
		});
		this.logger.log(`Agent ${user.id} joined org room ${room}`);
		return {
			event: "agent:joined",
			data: { organizationId: data.organizationId },
		};
	}

	async handleDisconnect(client: Socket) {
		const user = client.data.user;
		if (user?.type !== "AGENT") return;
		const orgIds: string[] = client.data.orgIds ?? [];
		for (const organizationId of orgIds) {
			this.server.to(SseKey.org(organizationId)).emit("agent:offline", {
				agentId: user.id,
				organizationId,
				at: new Date().toISOString(),
			});
		}
		this.logger.log(`Agent disconnected: ${user.id} (${client.id})`);
	}
}
