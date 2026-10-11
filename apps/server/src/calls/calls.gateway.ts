import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { CALLS_NAMESPACE, userRoom } from "@package/call-signaling";
import { Server, Socket } from "socket.io";
import { getCorsOrigins } from "../common/cors";

/**
 * Signaling gateway for audio/video calls. Media never passes through here -
 * this namespace only authenticates sockets, tracks user rooms, and (from
 * Phase 3) relays WebRTC signaling between joined call participants.
 */
@WebSocketGateway({
	namespace: CALLS_NAMESPACE,
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(CallsGateway.name);

	constructor(private readonly jwtService: JwtService) {}

	/**
	 * Handshake auth: a valid JWT is required. Identity is stamped from the
	 * verified token only - `from` fields in client payloads are never
	 * trusted (derived from socket.data.userId in every handler instead).
	 */
	async handleConnection(client: Socket) {
		const token =
			client.handshake.auth?.token ??
			client.handshake.headers?.authorization?.replace("Bearer ", "");
		if (!token) {
			this.logger.warn(`Rejected ${client.id}: no token`);
			client.disconnect();
			return;
		}
		try {
			const payload = await this.jwtService.verifyAsync<{ id: string }>(token);
			if (!payload?.id) throw new Error("missing sub");
			client.data.userId = payload.id;
			await client.join(userRoom(payload.id));
			this.logger.log(`Call socket connected: ${payload.id} (${client.id})`);
		} catch {
			this.logger.warn(`Rejected ${client.id}: invalid token`);
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		// Phase 7: treat a user with no connected sockets for ~20s as left.
		this.logger.log(`Call socket disconnected: ${client.id}`);
	}
}
