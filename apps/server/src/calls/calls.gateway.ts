import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from "@nestjs/websockets";
import {
	CALLS_NAMESPACE,
	type CallPeerInfo,
	callRoom,
	ServerCallEvents,
	userRoom,
} from "@package/call-signaling";
import { Server, Socket } from "socket.io";
import { getCorsOrigins } from "../common/cors";
import {
	CallsService,
	type EndCallResult,
	type JoinCallResult,
} from "./calls.service";
import {
	CallIdDto,
	CallInviteDto,
	CallMediaStateDto,
	WebrtcAnswerDto,
	WebrtcIceDto,
	WebrtcOfferDto,
} from "./dto/call.dto";

/** Max webrtc:ice messages per socket per window (flood guard). */
const ICE_RATE_LIMIT = 100;
const ICE_RATE_WINDOW_MS = 10_000;

/**
 * Signaling gateway for audio/video calls. Media never passes through here -
 * this namespace only authenticates sockets and relays WebRTC signaling
 * between joined call participants. Identity always comes from
 * socket.data.userId (stamped at handshake); client `from` fields are
 * never trusted.
 */
@WebSocketGateway({
	namespace: CALLS_NAMESPACE,
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(CallsGateway.name);

	/** callId -> ring-timeout timer (cleared when the call goes ACTIVE/ENDED). */
	private readonly ringTimers = new Map<string, NodeJS.Timeout>();
	/** socket.id -> recent webrtc:ice timestamps (rate limiting). */
	private readonly iceHits = new Map<string, number[]>();

	constructor(
		private readonly jwtService: JwtService,
		private readonly callsService: CallsService,
	) {}

	/**
	 * Handshake auth: a valid JWT is required. Identity is stamped from the
	 * verified token only.
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
		this.iceHits.delete(client.id);
		// Phase 7: treat a user with no connected sockets for ~20s as left.
		this.logger.log(`Call socket disconnected: ${client.id}`);
	}

	private userIdOf(client: Socket): string {
		const userId = client.data.userId as string | undefined;
		if (!userId) throw new WsException("Unauthenticated");
		return userId;
	}

	/** Wraps service HTTP exceptions into WsException for socket callers. */
	private async guard<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return await fn();
		} catch (err) {
			if (err instanceof WsException) throw err;
			const message = err instanceof Error ? err.message : "Call operation failed";
			throw new WsException(message);
		}
	}

	private scheduleRingTimeout(callId: string): void {
		this.clearRingTimeout(callId);
		const timer = setTimeout(() => {
			this.ringTimers.delete(callId);
			void this.expireRing(callId);
		}, this.callsService.ringTimeoutSeconds * 1000);
		// Don't keep the process alive for ringing calls alone.
		timer.unref();
		this.ringTimers.set(callId, timer);
	}

	private clearRingTimeout(callId: string): void {
		const timer = this.ringTimers.get(callId);
		if (timer) {
			clearTimeout(timer);
			this.ringTimers.delete(callId);
		}
	}

	/** Timer-driven ring expiry (lazy expiry inside the service backstops this). */
	private async expireRing(callId: string): Promise<void> {
		try {
			const ended = await this.callsService.expireCallIfDueById(callId);
			if (ended) this.emitEnded(ended);
		} catch (err) {
			this.logger.warn(`Ring expiry for ${callId} failed: ${err}`);
		}
	}

	private emitEnded(ended: EndCallResult): void {
		this.clearRingTimeout(ended.callId);
		const payload = { callId: ended.callId, reason: ended.reason };
		this.server.to(callRoom(ended.callId)).emit(ServerCallEvents.ENDED, payload);
		// Also reach rung devices that never joined the call room.
		for (const userId of ended.memberUserIds) {
			this.server.to(userRoom(userId)).emit(ServerCallEvents.ENDED, payload);
		}
	}

	/**
	 * Joins the socket to the call room and notifies everyone. Shared by
	 * invite (starter), join, and the glare-merge path.
	 */
	private async syncJoin(
		client: Socket,
		userId: string,
		result: JoinCallResult,
	): Promise<{ callId: string; peers: CallPeerInfo[] }> {
		if (result.expired) {
			this.emitEnded(result.expired);
			throw new WsException("Call already ended");
		}
		if (result.becameActive) this.clearRingTimeout(result.call.id);
		await client.join(callRoom(result.call.id));
		client.to(callRoom(result.call.id)).emit(ServerCallEvents.PEER_JOINED, {
			callId: result.call.id,
			userId,
		});
		// Dismiss ringing on the joiner's other devices.
		this.server.to(userRoom(userId)).emit(ServerCallEvents.HANDLED, {
			callId: result.call.id,
		});
		return { callId: result.call.id, peers: result.peers };
	}

	@SubscribeMessage("call:invite")
	async handleInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallInviteDto,
	) {
		const from = this.userIdOf(client);
		let started: Awaited<ReturnType<CallsService["startCall"]>>;
		try {
			started = await this.callsService.startCall(
				from,
				dto.conversationId,
				dto.type,
				dto.inviteeIds,
			);
		} catch (err) {
			const activeCallId = await this.callsService.getActiveCallId(from);
			this.emitCapacityEvent(from, activeCallId, err);
			throw new WsException(err instanceof Error ? err.message : "Call failed");
		}
		if (started.merged && started.join) {
			// Glare: folded into the other side's ringing call - sync like a join.
			return this.syncJoin(client, from, started.join);
		}
		// The starter is already JOINED by startCall - just sync the socket.
		await this.syncJoin(client, from, {
			call: started.call,
			becameActive: false,
			peers: [],
		});
		for (const userId of started.rungUserIds) {
			this.server.to(userRoom(userId)).emit(ServerCallEvents.INCOMING, {
				callId: started.call.id,
				from,
				type: started.call.type,
				conversationId: started.call.conversationId,
			});
		}
		this.scheduleRingTimeout(started.call.id);
		return { callId: started.call.id };
	}

	@SubscribeMessage("call:join")
	async handleJoin(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallIdDto,
	) {
		const userId = this.userIdOf(client);
		let result: Awaited<ReturnType<CallsService["joinCall"]>>;
		try {
			result = await this.callsService.joinCall(userId, dto.callId);
		} catch (err) {
			this.emitCapacityEvent(userId, dto.callId, err);
			throw new WsException(err instanceof Error ? err.message : "Join failed");
		}
		return this.syncJoin(client, userId, result);
	}

	@SubscribeMessage("call:reject")
	async handleReject(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallIdDto,
	) {
		const userId = this.userIdOf(client);
		const ended = await this.guard(() =>
			this.callsService.rejectCall(userId, dto.callId),
		);
		if (ended) this.emitEnded(ended);
		return { callId: dto.callId };
	}

	@SubscribeMessage("call:leave")
	async handleLeave(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallIdDto,
	) {
		const userId = this.userIdOf(client);
		const ended = await this.guard(() =>
			this.callsService.leaveCall(userId, dto.callId),
		);
		await client.leave(callRoom(dto.callId));
		if (ended) {
			this.emitEnded(ended);
		} else {
			this.server.to(callRoom(dto.callId)).emit(ServerCallEvents.PEER_LEFT, {
				callId: dto.callId,
				userId,
			});
		}
		return { callId: dto.callId };
	}

	@SubscribeMessage("webrtc:offer")
	async handleOffer(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: WebrtcOfferDto,
	) {
		const from = this.userIdOf(client);
		await this.guard(() =>
			this.callsService.assertCanRelay(from, dto.callId, dto.to),
		);
		this.server
			.to(userRoom(dto.to))
			.emit(ServerCallEvents.OFFER, { callId: dto.callId, from, sdp: dto.sdp });
		return { ok: true };
	}

	@SubscribeMessage("webrtc:answer")
	async handleAnswer(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: WebrtcAnswerDto,
	) {
		const from = this.userIdOf(client);
		await this.guard(() =>
			this.callsService.assertCanRelay(from, dto.callId, dto.to),
		);
		this.server
			.to(userRoom(dto.to))
			.emit(ServerCallEvents.ANSWER, { callId: dto.callId, from, sdp: dto.sdp });
		return { ok: true };
	}

	@SubscribeMessage("webrtc:ice")
	async handleIce(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: WebrtcIceDto,
	) {
		const from = this.userIdOf(client);
		this.checkIceRateLimit(client.id);
		await this.guard(() =>
			this.callsService.assertCanRelay(from, dto.callId, dto.to),
		);
		this.server.to(userRoom(dto.to)).emit(ServerCallEvents.ICE, {
			callId: dto.callId,
			from,
			candidate: {
				candidate: dto.candidate.candidate,
				sdpMid: dto.candidate.sdpMid ?? null,
				sdpMLineIndex: dto.candidate.sdpMLineIndex ?? null,
			},
		});
		return { ok: true };
	}

	@SubscribeMessage("call:media-state")
	async handleMediaState(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallMediaStateDto,
	) {
		const userId = this.userIdOf(client);
		await this.guard(() =>
			this.callsService.setMediaState(userId, dto.callId, dto.audio, dto.video),
		);
		this.server.to(callRoom(dto.callId)).emit(ServerCallEvents.MEDIA_STATE, {
			callId: dto.callId,
			userId,
			audio: dto.audio,
			video: dto.video,
		});
		return { ok: true };
	}

	/**
	 * Surfaces capacity failures as events too (clients already listen for
	 * these; the throw still fails the ack so callers can't miss it).
	 * No event is sent when there is no call to reference.
	 */
	private emitCapacityEvent(
		userId: string,
		callId: string | null,
		err: unknown,
	): void {
		if (!callId) return;
		const message = err instanceof Error ? err.message : "";
		if (message.toLowerCase().includes("full")) {
			this.server.to(userRoom(userId)).emit(ServerCallEvents.FULL, { callId });
		} else if (message.toLowerCase().includes("busy")) {
			this.server
				.to(userRoom(userId))
				.emit(ServerCallEvents.BUSY, { callId, userId });
		}
	}

	private checkIceRateLimit(socketId: string): void {
		const now = Date.now();
		const hits = (this.iceHits.get(socketId) ?? []).filter(
			(t) => now - t < ICE_RATE_WINDOW_MS,
		);
		if (hits.length >= ICE_RATE_LIMIT) {
			throw new WsException("ICE rate limit exceeded");
		}
		hits.push(now);
		this.iceHits.set(socketId, hits);
	}
}
