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
	roomForPeer,
	ServerCallEvents,
} from "@package/call-signaling";
import { Server, Socket } from "socket.io";
import { tokenFromHandshake } from "../common/auth/socket-token";
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

/** How long a peer may have zero sockets before being dropped from a call. */
const GONE_GRACE_MS = 20_000;

/**
 * Signaling gateway for audio/video calls. Media never passes through here -
 * this namespace only authenticates sockets and relays WebRTC signaling
 * between joined call participants. Identity always comes from the handshake
 * (agent JWT or visitor call token) and is stored as a unified peer id
 * (`user:<id>` / `visitor:<id>`); client `from` fields are never trusted.
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
	/** peerId -> grace timer for treating a fully-gone peer as left. */
	private readonly goneTimers = new Map<string, NodeJS.Timeout>();
	/** socket.id -> recent webrtc:ice timestamps (rate limiting). */
	private readonly iceHits = new Map<string, number[]>();

	constructor(
		private readonly jwtService: JwtService,
		private readonly callsService: CallsService,
	) {}

	/**
	 * Handshake auth: an agent JWT or a visitor call token is required.
	 * Either way identity is stamped from the verified token only.
	 */
	async handleConnection(client: Socket) {
		// Bearer/auth-token first, then the httpOnly `access` cookie - the
		// dashboard authenticates sockets the same way as HTTP (see JwtStrategy).
		const token = tokenFromHandshake(client);
		if (!token) {
			this.logger.warn(`Rejected ${client.id}: no token`);
			client.disconnect();
			return;
		}
		const peerId = await this.resolveHandshakePeer(token);
		if (!peerId) {
			this.logger.warn(`Rejected ${client.id}: invalid token`);
			client.disconnect();
			return;
		}
		client.data.peerId = peerId;
		await client.join(roomForPeer(peerId));
		this.clearGoneTimer(peerId);
		// Best effort: clear presence orphaned by a restart (stuck busy).
		void this.callsService.reconcilePeer(peerId).catch((err) => {
			this.logger.warn(`reconcilePeer ${peerId} failed: ${err}`);
		});
		this.logger.log(`Call socket connected: ${peerId} (${client.id})`);
	}

	private async resolveHandshakePeer(token: string): Promise<string | null> {
		// Agents first (existing JWT behaviour, unchanged).
		try {
			const payload = await this.jwtService.verifyAsync<{ id: string }>(token);
			if (payload?.id) return this.callsService.peerIdOfUser(payload.id);
		} catch {
			// Not an agent token - try a visitor call token.
		}
		try {
			const visitor = await this.callsService.verifyVisitorCallToken(token);
			return this.callsService.peerIdOfVisitor(visitor.visitorId);
		} catch {
			return null;
		}
	}

	handleDisconnect(client: Socket) {
		this.iceHits.delete(client.id);
		const peerId = client.data.peerId as string | undefined;
		if (peerId) this.scheduleGoneCheck(peerId);
		this.logger.log(`Call socket disconnected: ${client.id}`);
	}

	private peerIdOf(client: Socket): string {
		const peerId = client.data.peerId as string | undefined;
		if (!peerId) throw new WsException("Unauthenticated");
		return peerId;
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
		for (const peerId of ended.memberPeerIds) {
			this.server.to(roomForPeer(peerId)).emit(ServerCallEvents.ENDED, payload);
		}
	}

	/**
	 * Grace period: a peer whose sockets are all gone for ~20s is treated as
	 * left (their client normally re-joins on reconnect before this fires).
	 * fetchSockets works across instances via the Redis adapter.
	 */
	private scheduleGoneCheck(peerId: string): void {
		this.clearGoneTimer(peerId);
		const timer = setTimeout(() => {
			this.goneTimers.delete(peerId);
			void this.dropGonePeer(peerId);
		}, GONE_GRACE_MS);
		timer.unref();
		this.goneTimers.set(peerId, timer);
	}

	private clearGoneTimer(peerId: string): void {
		const timer = this.goneTimers.get(peerId);
		if (timer) {
			clearTimeout(timer);
			this.goneTimers.delete(peerId);
		}
	}

	private async dropGonePeer(peerId: string): Promise<void> {
		try {
			const sockets = await this.server.in(roomForPeer(peerId)).fetchSockets();
			if (sockets.length > 0) return;
			const callId = await this.callsService.getActiveCallId(peerId);
			if (!callId) return;
			const ended = await this.callsService.leaveCall(peerId, callId);
			this.applyLeaveResult(callId, peerId, ended);
			this.logger.log(`Dropped gone peer ${peerId} from call ${callId}`);
		} catch (err) {
			this.logger.warn(`dropGonePeer ${peerId} failed: ${err}`);
		}
	}

	/**
	 * Joins the socket to the call room and notifies everyone. Shared by
	 * invite (starter), join, and the glare-merge path.
	 */
	private async syncJoin(
		client: Socket,
		peerId: string,
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
			peerId,
		});
		// Dismiss ringing on the joiner's other devices.
		this.server.to(roomForPeer(peerId)).emit(ServerCallEvents.HANDLED, {
			callId: result.call.id,
		});
		return { callId: result.call.id, peers: result.peers };
	}

	@SubscribeMessage("call:invite")
	async handleInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallInviteDto,
	) {
		const from = this.peerIdOf(client);
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
		for (const peerId of started.rungPeerIds) {
			this.server.to(roomForPeer(peerId)).emit(ServerCallEvents.INCOMING, {
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
		const peerId = this.peerIdOf(client);
		let result: Awaited<ReturnType<CallsService["joinCall"]>>;
		try {
			result = await this.callsService.joinCall(peerId, dto.callId);
		} catch (err) {
			this.emitCapacityEvent(peerId, dto.callId, err);
			throw new WsException(err instanceof Error ? err.message : "Join failed");
		}
		return this.syncJoin(client, peerId, result);
	}

	@SubscribeMessage("call:reject")
	async handleReject(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallIdDto,
	) {
		const peerId = this.peerIdOf(client);
		const ended = await this.guard(() =>
			this.callsService.rejectCall(peerId, dto.callId),
		);
		if (ended) this.emitEnded(ended);
		return { callId: dto.callId };
	}

	@SubscribeMessage("call:leave")
	async handleLeave(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: CallIdDto,
	) {
		const peerId = this.peerIdOf(client);
		const ended = await this.guard(() =>
			this.callsService.leaveCall(peerId, dto.callId),
		);
		await client.leave(callRoom(dto.callId));
		this.applyLeaveResult(dto.callId, peerId, ended);
		return { callId: dto.callId };
	}

	private applyLeaveResult(
		callId: string,
		peerId: string,
		ended: EndCallResult | null,
	): void {
		if (ended) {
			this.emitEnded(ended);
		} else {
			this.server.to(callRoom(callId)).emit(ServerCallEvents.PEER_LEFT, {
				callId,
				peerId,
			});
		}
	}

	@SubscribeMessage("webrtc:offer")
	async handleOffer(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: WebrtcOfferDto,
	) {
		const from = this.peerIdOf(client);
		await this.guard(() =>
			this.callsService.assertCanRelay(from, dto.callId, dto.to),
		);
		this.server
			.to(roomForPeer(dto.to))
			.emit(ServerCallEvents.OFFER, { callId: dto.callId, from, sdp: dto.sdp });
		return { ok: true };
	}

	@SubscribeMessage("webrtc:answer")
	async handleAnswer(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: WebrtcAnswerDto,
	) {
		const from = this.peerIdOf(client);
		await this.guard(() =>
			this.callsService.assertCanRelay(from, dto.callId, dto.to),
		);
		this.server
			.to(roomForPeer(dto.to))
			.emit(ServerCallEvents.ANSWER, { callId: dto.callId, from, sdp: dto.sdp });
		return { ok: true };
	}

	@SubscribeMessage("webrtc:ice")
	async handleIce(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: WebrtcIceDto,
	) {
		const from = this.peerIdOf(client);
		this.checkIceRateLimit(client.id);
		await this.guard(() =>
			this.callsService.assertCanRelay(from, dto.callId, dto.to),
		);
		this.server.to(roomForPeer(dto.to)).emit(ServerCallEvents.ICE, {
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
		const peerId = this.peerIdOf(client);
		await this.guard(() =>
			this.callsService.setMediaState(peerId, dto.callId, dto.audio, dto.video),
		);
		this.server.to(callRoom(dto.callId)).emit(ServerCallEvents.MEDIA_STATE, {
			callId: dto.callId,
			peerId,
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
		peerId: string,
		callId: string | null,
		err: unknown,
	): void {
		if (!callId) return;
		const message = err instanceof Error ? err.message : "";
		if (message.toLowerCase().includes("full")) {
			this.server.to(roomForPeer(peerId)).emit(ServerCallEvents.FULL, { callId });
		} else if (message.toLowerCase().includes("busy")) {
			this.server
				.to(roomForPeer(peerId))
				.emit(ServerCallEvents.BUSY, { callId, peerId });
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
