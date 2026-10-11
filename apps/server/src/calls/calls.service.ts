import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	type CallEndReason,
	type CallPeerInfo,
	DEFAULT_CALL_MAX_PARTICIPANTS,
	DEFAULT_CALL_RING_TIMEOUT_SECONDS,
	type PeerId,
	parsePeerId,
	peerIdForUser,
	peerIdForVisitor,
} from "@package/call-signaling";
import type { Call, Conversation } from "../generated/prisma/client";
import { MessageService } from "../message/message.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { WidgetEventsPublisher } from "../visitor/events/widget-events.publisher";
import {
	CALL_PRESENCE_TTL_SECONDS,
	callKey,
	callMediaKey,
	callParticipantsKey,
	callRingKey,
	peerActiveCallKey,
} from "./keys";

/** Scope marker inside visitor call tokens (short-lived, conversation-bound). */
const VISITOR_CALL_SCOPE = "visitor-call";
/** Visitor call tokens live just long enough to connect (re-issued per call). */
const VISITOR_TOKEN_TTL_SECONDS = 600;

export interface VisitorCallTokenPayload {
	visitorId: string;
	conversationId: string;
	organizationId: string;
	scope: string;
}

export interface StartCallResult {
	call: Call;
	/** True when the invite merged into the other side's ringing call (glare). */
	merged: boolean;
	/** Peers that were actually rung (busy/non-member peers excluded). */
	rungPeerIds: PeerId[];
	/** Join outcome when merged (glare path joins immediately). */
	join?: JoinCallResult;
}

export interface JoinCallResult {
	call: Call;
	/** True when this join flipped the call RINGING -> ACTIVE. */
	becameActive: boolean;
	peers: CallPeerInfo[];
	/** Set when the call expired before the join landed (already emitted). */
	expired?: EndCallResult;
}

export interface EndCallResult {
	callId: string;
	reason: CallEndReason;
	/** Every peerId that was part of the call (for room cleanup/notifies). */
	memberPeerIds: string[];
}

export type PeerRef = { kind: "user" | "visitor"; id: string };

/**
 * Owns call state for agents (`user:<id>`) and visitors (`visitor:<id>`)
 * under one unified peer identity. Postgres is the durable record; Redis
 * holds ephemeral presence (joined set, media flags, per-peer active-call
 * markers) with TTLs as a backstop - all cleared explicitly on terminal
 * transitions.
 *
 * Throws standard HTTP exceptions; the gateway translates them to
 * WsException for socket callers.
 */
@Injectable()
export class CallsService {
	private readonly logger = new Logger(CallsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService,
		private readonly jwtService: JwtService,
		private readonly messageService: MessageService,
		private readonly widgetEvents: WidgetEventsPublisher,
	) {}

	get maxParticipants(): number {
		const raw = Number(process.env.CALL_MAX_PARTICIPANTS);
		return Number.isInteger(raw) && raw >= 2
			? raw
			: DEFAULT_CALL_MAX_PARTICIPANTS;
	}

	get ringTimeoutSeconds(): number {
		const raw = Number(process.env.CALL_RING_TIMEOUT_SECONDS);
		return Number.isInteger(raw) && raw > 0
			? raw
			: DEFAULT_CALL_RING_TIMEOUT_SECONDS;
	}

	// ─── Peer identity ──────────────────────────────────────────

	resolvePeer(peerId: string): PeerRef {
		const parsed = parsePeerId(peerId);
		if (!parsed) throw new BadRequestException("Malformed peer id");
		return parsed;
	}

	peerIdOfUser(userId: string): PeerId {
		return peerIdForUser(userId);
	}

	peerIdOfVisitor(visitorId: string): PeerId {
		return peerIdForVisitor(visitorId);
	}

	private peerToParticipant(
		peer: PeerRef,
	): { userId: string } | { visitorId: string } {
		return peer.kind === "user" ? { userId: peer.id } : { visitorId: peer.id };
	}

	private participantPeerId(row: {
		userId: string | null;
		visitorId: string | null;
	}): PeerId {
		if (row.userId) return peerIdForUser(row.userId);
		if (row.visitorId) return peerIdForVisitor(row.visitorId);
		throw new Error("Call participant has neither user nor visitor");
	}

	// ─── Visitor call tokens ────────────────────────────────────

	/**
	 * Mints a short-lived, conversation-bound token that lets a widget
	 * visitor connect to the /calls namespace. The browser is identified by
	 * the httpOnly visitor_session cookie (its value is Visitor.externalId);
	 * the conversation must belong to that visitor.
	 */
	async createVisitorCallToken(
		sessionId: string | undefined,
		organizationId: string,
		conversationId: string,
	): Promise<{ token: string; visitorId: string; expiresIn: number }> {
		if (!sessionId) {
			throw new UnauthorizedException("No visitor session");
		}
		const visitor = await this.prisma.visitor.findFirst({
			where: { organizationId, externalId: sessionId },
			select: { id: true },
		});
		if (!visitor) throw new UnauthorizedException("Unknown visitor session");
		const conversation = await this.prisma.conversation.findUnique({
			where: { id: conversationId },
			select: { id: true, visitorId: true, organizationId: true },
		});
		if (
			!conversation ||
			conversation.organizationId !== organizationId ||
			conversation.visitorId !== visitor.id
		) {
			throw new ForbiddenException("Conversation does not belong to this visitor");
		}
		const token = await this.jwtService.signAsync({
			visitorId: visitor.id,
			conversationId,
			organizationId,
			scope: VISITOR_CALL_SCOPE,
		});
		return { token, visitorId: visitor.id, expiresIn: VISITOR_TOKEN_TTL_SECONDS };
	}

	async verifyVisitorCallToken(token: string): Promise<VisitorCallTokenPayload> {
		try {
			const payload =
				await this.jwtService.verifyAsync<VisitorCallTokenPayload>(token);
			if (payload?.scope !== VISITOR_CALL_SCOPE || !payload.visitorId) {
				throw new Error("not a visitor call token");
			}
			return payload;
		} catch {
			throw new UnauthorizedException("Invalid visitor call token");
		}
	}

	// ─── Membership ─────────────────────────────────────────────

	/**
	 * A peer may start or join a call only with standing in the conversation:
	 * agents via organization membership, visitors only in their own
	 * conversation.
	 */
	async requirePeerConversationMember(
		peer: PeerRef,
		conversationId: string,
	): Promise<Conversation> {
		const conversation = await this.prisma.conversation.findUnique({
			where: { id: conversationId },
		});
		if (!conversation) throw new NotFoundException("Conversation not found");
		if (peer.kind === "user") {
			const membership = await this.prisma.organizationMember.findUnique({
				where: {
					userId_organizationId: {
						userId: peer.id,
						organizationId: conversation.organizationId,
					},
				},
			});
			if (!membership) {
				throw new ForbiddenException("You are not a member of this conversation");
			}
		} else if (conversation.visitorId !== peer.id) {
			throw new ForbiddenException("This conversation is not yours");
		}
		return conversation;
	}

	async getActiveCallId(peerId: string): Promise<string | null> {
		return this.redis.get(peerActiveCallKey(peerId));
	}

	// ─── Invite / join / reject / leave ─────────────────────────

	async startCall(
		starterPeerId: string,
		conversationId: string,
		type: "AUDIO" | "VIDEO",
		inviteeIds: string[] | undefined,
	): Promise<StartCallResult> {
		const starter = this.resolvePeer(starterPeerId);
		const conversation = await this.requirePeerConversationMember(
			starter,
			conversationId,
		);

		// Normalize invitees to peer ids (bare ids mean agents).
		const explicit =
			inviteeIds?.map((id) => (parsePeerId(id) ? id : peerIdForUser(id))) ?? [];
		const wanted = explicit.filter((id) => id !== starterPeerId);

		// Counter-invite glare: a peer who is being rung (INVITED) in a
		// ringing call answers it by inviting back. Deterministic rule -
		// fold into the existing call when it covers every target instead
		// of failing busy or forking a second call.
		const existingActiveId = await this.getActiveCallId(starterPeerId);
		if (existingActiveId) {
			const existing = await this.prisma.call.findUnique({
				where: { id: existingActiveId },
				include: {
					participants: { select: { userId: true, visitorId: true, status: true } },
				},
			});
			const starterRow = existing?.participants.find((p) =>
				starter.kind === "user"
					? p.userId === starter.id
					: p.visitorId === starter.id,
			);
			const memberIds = (existing?.participants ?? []).map((p) =>
				this.participantPeerId(p),
			);
			const covers =
				!inviteeIds || wanted.every((t) => memberIds.includes(t as PeerId));
			if (
				existing?.status === "RINGING" &&
				existing.conversationId === conversationId &&
				starterRow?.status === "INVITED" &&
				covers
			) {
				const join = await this.joinCall(starterPeerId, existing.id);
				return { call: join.call, merged: true, rungPeerIds: [], join };
			}
			throw new ConflictException("You are already in a call");
		}

		// Default target: the conversation's visitor (if any) plus every
		// other member of the conversation's org (agents), capped.
		let targets = explicit.filter((id) => id !== starterPeerId);
		if (targets.length === 0 && !inviteeIds) {
			const members = await this.prisma.organizationMember.findMany({
				where: { organizationId: conversation.organizationId },
				select: { userId: true },
			});
			const agentTargets = members
				.map((m) => peerIdForUser(m.userId))
				.filter((id) => id !== starterPeerId);
			const visitorTarget =
				conversation.visitorId &&
				peerIdForVisitor(conversation.visitorId) !== starterPeerId
					? [peerIdForVisitor(conversation.visitorId)]
					: [];
			targets = [...visitorTarget, ...agentTargets].slice(
				0,
				this.maxParticipants - 1,
			);
		}
		if (targets.length === 0) {
			throw new BadRequestException("No one to call in this conversation");
		}
		if (targets.length + 1 > this.maxParticipants) {
			throw new ConflictException(
				`Call is full (max ${this.maxParticipants} participants)`,
			);
		}

		// Glare: both sides ringing each other in the same conversation.
		// Deterministic rule - the earlier call wins; the later invite merges
		// into it instead of creating a second call.
		for (const targetPeerId of targets) {
			const targetActiveId = await this.getActiveCallId(targetPeerId);
			if (!targetActiveId) continue;
			const targetCall = await this.prisma.call.findUnique({
				where: { id: targetActiveId },
				select: {
					id: true,
					status: true,
					conversationId: true,
					startedById: true,
					startedByVisitorId: true,
				},
			});
			if (
				targetCall?.status !== "RINGING" ||
				targetCall.conversationId !== conversationId
			) {
				continue;
			}
			const targetPeer = this.resolvePeer(targetPeerId);
			const startedByOther =
				(targetPeer.kind === "user" && targetCall.startedById === targetPeer.id) ||
				(targetPeer.kind === "visitor" &&
					targetCall.startedByVisitorId === targetPeer.id);
			if (startedByOther) {
				const join = await this.joinCall(starterPeerId, targetCall.id);
				return { call: join.call, merged: true, rungPeerIds: [], join };
			}
		}

		// Skip peers who are busy or lack standing; fail if nobody is left.
		const rungPeerIds: PeerId[] = [];
		for (const targetPeerId of targets) {
			const target = this.resolvePeer(targetPeerId);
			try {
				await this.requirePeerConversationMember(target, conversationId);
			} catch {
				continue;
			}
			if (await this.getActiveCallId(targetPeerId)) continue;
			rungPeerIds.push(targetPeerId as PeerId);
		}
		if (rungPeerIds.length === 0) {
			throw new ConflictException("Everyone you are calling is busy");
		}

		const starterField =
			starter.kind === "user" ? { userId: starter.id } : { visitorId: starter.id };
		const call = await this.prisma.call.create({
			data: {
				conversationId,
				type,
				status: "RINGING",
				...(starter.kind === "user"
					? { startedById: starter.id }
					: { startedByVisitorId: starter.id }),
				participants: {
					create: [
						{ ...starterField, status: "JOINED", joinedAt: new Date() },
						...rungPeerIds.map((peerId) => {
							const peer = this.resolvePeer(peerId);
							return {
								...(peer.kind === "user"
									? { userId: peer.id }
									: { visitorId: peer.id }),
								status: "INVITED" as const,
							};
						}),
					],
				},
			},
		});

		const ringDeadline = Date.now() + this.ringTimeoutSeconds * 1000;
		await this.redis.hSet(callKey(call.id), "status", "RINGING");
		await this.redis.hSet(callKey(call.id), "conversationId", conversationId);
		await this.redis.hSet(callKey(call.id), "type", type);
		await this.redis.hSet(callKey(call.id), "ringDeadline", String(ringDeadline));
		await this.redis.sAdd(callParticipantsKey(call.id), starterPeerId);
		await this.redis.hSet(
			callMediaKey(call.id),
			starterPeerId,
			JSON.stringify({ audio: true, video: type === "VIDEO" }),
		);
		// Ring marker expires on its own; the gateway timer + lazy expiry below
		// handle the MISSED transition even if the scheduling instance dies.
		await this.redis.set(callRingKey(call.id), "1", this.ringTimeoutSeconds);
		await this.redis.set(
			peerActiveCallKey(starterPeerId),
			call.id,
			CALL_PRESENCE_TTL_SECONDS,
		);
		for (const peerId of rungPeerIds) {
			await this.redis.set(
				peerActiveCallKey(peerId),
				call.id,
				CALL_PRESENCE_TTL_SECONDS,
			);
		}

		return { call, merged: false, rungPeerIds };
	}

	async joinCall(peerId: string, callId: string): Promise<JoinCallResult> {
		const peer = this.resolvePeer(peerId);
		const call = await this.getCall(callId);
		await this.requirePeerConversationMember(peer, call.conversationId);
		const expired = await this.expireRingIfDue(call);
		if (expired) return { call, becameActive: false, peers: [], expired };

		const active = await this.getActiveCallId(peerId);
		if (active && active !== callId) {
			throw new ConflictException("You are already in another call");
		}

		const participant = await this.findParticipant(callId, peer);
		if (!participant) {
			// A peer with standing may join a call they were not invited to
			// (group call), subject to the cap.
			if ((await this.joinedCount(callId)) >= this.maxParticipants) {
				throw new ConflictException(
					`Call is full (max ${this.maxParticipants} participants)`,
				);
			}
			await this.prisma.callParticipant.create({
				data: {
					callId,
					...this.peerToParticipant(peer),
					status: "JOINED",
					joinedAt: new Date(),
				},
			});
		} else if (
			participant.status === "REJECTED" ||
			participant.status === "MISSED"
		) {
			throw new ConflictException("You cannot join this call anymore");
		} else if (participant.status !== "JOINED") {
			if ((await this.joinedCount(callId)) >= this.maxParticipants) {
				throw new ConflictException(
					`Call is full (max ${this.maxParticipants} participants)`,
				);
			}
			await this.prisma.callParticipant.update({
				where: { id: participant.id },
				data: { status: "JOINED", joinedAt: new Date(), leftAt: null },
			});
		}

		await this.redis.set(
			peerActiveCallKey(peerId),
			callId,
			CALL_PRESENCE_TTL_SECONDS,
		);
		await this.redis.sAdd(callParticipantsKey(callId), peerId);

		let becameActive = false;
		let updated = call;
		if (call.status === "RINGING") {
			// First non-starter join flips RINGING -> ACTIVE.
			const starterPeerId = this.starterPeerIdOf(call);
			const joinedIds = await this.redis.sMembers(callParticipantsKey(callId));
			if (joinedIds.some((id) => id !== starterPeerId)) {
				updated = await this.prisma.call.update({
					where: { id: callId },
					data: { status: "ACTIVE", answeredAt: new Date() },
				});
				await this.redis.hSet(callKey(callId), "status", "ACTIVE");
				await this.redis.del(callRingKey(callId));
				becameActive = true;
			}
		}

		const peers = await this.getPeers(callId, peerId);
		return { call: updated, becameActive, peers };
	}

	async rejectCall(
		peerId: string,
		callId: string,
	): Promise<EndCallResult | null> {
		const peer = this.resolvePeer(peerId);
		const call = await this.getCall(callId);
		const expired = await this.expireRingIfDue(call);
		if (expired) return expired;
		const participant = await this.findParticipant(callId, peer);
		if (participant?.status !== "INVITED") {
			throw new ConflictException("Nothing to reject");
		}
		await this.prisma.callParticipant.update({
			where: { id: participant.id },
			data: { status: "REJECTED" },
		});
		await this.redis.del(peerActiveCallKey(peerId));

		// Nobody left to ring and nobody joined -> ENDED(REJECTED).
		// (The starter alone waiting goes MISSED via the ring timeout.)
		const [stillInvited, joinedOthers] = await Promise.all([
			this.prisma.callParticipant.count({ where: { callId, status: "INVITED" } }),
			this.prisma.callParticipant.count({
				where: { callId, status: "JOINED", NOT: this.starterFilter(call) },
			}),
		]);
		if (stillInvited === 0 && joinedOthers === 0) {
			return this.endCall(callId, "REJECTED");
		}
		return null;
	}

	async leaveCall(
		peerId: string,
		callId: string,
	): Promise<EndCallResult | null> {
		const peer = this.resolvePeer(peerId);
		const call = await this.getCall(callId);
		const expired = await this.expireRingIfDue(call);
		if (expired) return expired;
		const participant = await this.findParticipant(callId, peer);
		if (participant?.status !== "JOINED") {
			throw new ConflictException("You are not in this call");
		}
		await this.prisma.callParticipant.update({
			where: { id: participant.id },
			data: { status: "LEFT", leftAt: new Date() },
		});
		await this.redis.sRem(callParticipantsKey(callId), peerId);
		await this.redis.hDel(callMediaKey(callId), peerId);
		await this.redis.del(peerActiveCallKey(peerId));

		// The call ends when the last joined participant leaves.
		const stillJoined = await this.joinedCount(callId);
		if (stillJoined === 0) {
			return this.endCall(
				callId,
				call.status === "ACTIVE" ? "COMPLETED" : "CANCELLED",
			);
		}
		return null;
	}

	/**
	 * Guard for every relayed message: the call must allow signaling, and
	 * both sender and target must be joined participants of the same call.
	 */
	async assertCanRelay(
		fromPeerId: string,
		callId: string,
		toPeerId: string,
	): Promise<void> {
		const from = this.resolvePeer(fromPeerId);
		const to = this.resolvePeer(toPeerId);
		const call = await this.getCall(callId);
		const expired = await this.expireRingIfDue(call);
		if (expired) throw new ConflictException("Call already ended");
		if (call.status !== "ACTIVE") {
			throw new ConflictException("Call is not active");
		}
		const [fromRow, toRow] = await Promise.all([
			this.findParticipant(callId, from),
			this.findParticipant(callId, to),
		]);
		if (fromRow?.status !== "JOINED") {
			throw new ForbiddenException("You are not in this call");
		}
		if (toRow?.status !== "JOINED") {
			throw new ForbiddenException("Target is not in this call");
		}
	}

	async setMediaState(
		peerId: string,
		callId: string,
		audio: boolean,
		video: boolean,
	): Promise<void> {
		const peer = this.resolvePeer(peerId);
		const call = await this.getCall(callId);
		if (call.status !== "ACTIVE") {
			throw new ConflictException("Call is not active");
		}
		const participant = await this.findParticipant(callId, peer);
		if (participant?.status !== "JOINED") {
			throw new ForbiddenException("You are not in this call");
		}
		await this.redis.hSet(
			callMediaKey(callId),
			peerId,
			JSON.stringify({ audio, video }),
		);
	}

	async getPeers(
		callId: string,
		exceptPeerId?: string,
	): Promise<CallPeerInfo[]> {
		const joinedIds = await this.redis.sMembers(callParticipantsKey(callId));
		const media = await this.redis.hGetAll(callMediaKey(callId));
		const peers: CallPeerInfo[] = [];
		for (const id of joinedIds) {
			if (id === exceptPeerId) continue;
			let audio = true;
			let video = true;
			try {
				const parsed = JSON.parse(media[id] ?? "{}") as {
					audio?: boolean;
					video?: boolean;
				};
				if (typeof parsed.audio === "boolean") audio = parsed.audio;
				if (typeof parsed.video === "boolean") video = parsed.video;
			} catch {
				// Corrupt entry - fall back to defaults.
			}
			peers.push({ peerId: id as PeerId, audio, video });
		}
		return peers;
	}

	async getCallHistory(
		peerId: string,
		conversationId: string,
		cursor: string | undefined,
		limit: number,
	) {
		await this.requirePeerConversationMember(
			this.resolvePeer(peerId),
			conversationId,
		);
		const take = Math.min(Math.max(limit || 20, 1), 50);
		const calls = await this.prisma.call.findMany({
			where: { conversationId },
			orderBy: [{ startedAt: "desc" }, { id: "desc" }],
			take: take + 1,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			include: { participants: true },
		});
		const hasMore = calls.length > take;
		const page = hasMore ? calls.slice(0, take) : calls;
		return {
			items: page.map((call) => ({
				id: call.id,
				conversationId: call.conversationId,
				startedById: call.startedById,
				startedByVisitorId: call.startedByVisitorId,
				type: call.type,
				status: call.status,
				startedAt: call.startedAt.toISOString(),
				answeredAt: call.answeredAt?.toISOString() ?? null,
				endedAt: call.endedAt?.toISOString() ?? null,
				endReason: call.endReason,
				durationSeconds:
					call.answeredAt && call.endedAt
						? Math.max(
								0,
								Math.round((call.endedAt.getTime() - call.answeredAt.getTime()) / 1000),
							)
						: 0,
				participants: call.participants.map((p) => ({
					userId: p.userId,
					visitorId: p.visitorId,
					status: p.status,
					joinedAt: p.joinedAt?.toISOString() ?? null,
					leftAt: p.leftAt?.toISOString() ?? null,
				})),
			})),
			nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
		};
	}

	/**
	 * Lazy ring expiry, called at the top of every call operation: if the
	 * call is still RINGING past its deadline, transition to ENDED(MISSED).
	 * Backstops the gateway timer when the scheduling instance is gone.
	 */
	async expireRingIfDue(call: Call): Promise<EndCallResult | null> {
		if (call.status !== "RINGING") return null;
		const hash = await this.redis.hGetAll(callKey(call.id));
		const deadline = Number(hash.ringDeadline ?? 0);
		if (deadline > 0 && Date.now() < deadline) return null;
		// No Redis record (e.g. after a flush) - fall back to the DB timestamp.
		if (deadline <= 0) {
			const elapsed = Date.now() - call.startedAt.getTime();
			if (elapsed < this.ringTimeoutSeconds * 1000) return null;
		}
		return this.endCall(call.id, "MISSED");
	}

	/** Public read for the gateway (join-sync and lazy-expiry paths). */
	async getCall(callId: string): Promise<Call> {
		const call = await this.prisma.call.findUnique({ where: { id: callId } });
		if (!call) throw new NotFoundException("Call not found");
		return call;
	}

	/** Gateway entry for timer-driven and pre-operation lazy expiry. */
	async expireCallIfDueById(callId: string): Promise<EndCallResult | null> {
		const call = await this.prisma.call.findUnique({ where: { id: callId } });
		if (!call) return null;
		return this.expireRingIfDue(call);
	}

	private async findParticipant(callId: string, peer: PeerRef) {
		if (peer.kind === "user") {
			return this.prisma.callParticipant.findUnique({
				where: { callId_userId: { callId, userId: peer.id } },
			});
		}
		return this.prisma.callParticipant.findUnique({
			where: { callId_visitorId: { callId, visitorId: peer.id } },
		});
	}

	private async joinedCount(callId: string): Promise<number> {
		return this.prisma.callParticipant.count({
			where: { callId, status: "JOINED" },
		});
	}

	private starterPeerIdOf(call: Call): string {
		if (call.startedById) return peerIdForUser(call.startedById);
		if (call.startedByVisitorId) return peerIdForVisitor(call.startedByVisitorId);
		throw new Error(`Call ${call.id} has no starter`);
	}

	/** Prisma NOT-filter matching the starter (for "joined others" counts). */
	private starterFilter(call: Call): object {
		if (call.startedById) return { userId: call.startedById };
		return { visitorId: call.startedByVisitorId };
	}

	/** Terminal transition: persists ENDED + statuses, clears all presence. */
	private async endCall(
		callId: string,
		reason: CallEndReason,
	): Promise<EndCallResult> {
		const call = await this.prisma.call.findUnique({
			where: { id: callId },
			include: {
				participants: {
					select: { id: true, userId: true, visitorId: true, status: true },
				},
			},
		});
		if (!call) {
			await this.clearPresence(callId, []);
			return { callId, reason, memberPeerIds: [] };
		}
		const memberPeerIds = call.participants.map((p) => this.participantPeerId(p));
		if (call.status === "ENDED") {
			// Already terminal (race between timer and lazy expiry) - still
			// ensure presence is gone, then report the original outcome.
			await this.clearPresence(callId, memberPeerIds);
			return { callId, reason: call.endReason ?? reason, memberPeerIds };
		}
		for (const p of call.participants) {
			if (p.status === "INVITED") {
				await this.prisma.callParticipant.update({
					where: { id: p.id },
					data: { status: "MISSED" },
				});
			} else if (p.status === "JOINED") {
				await this.prisma.callParticipant.update({
					where: { id: p.id },
					data: { status: "LEFT", leftAt: new Date() },
				});
			}
		}
		const endedAt = new Date();
		await this.prisma.call.update({
			where: { id: callId },
			data: { status: "ENDED", endedAt, endReason: reason },
		});
		await this.clearPresence(callId, memberPeerIds);
		this.logger.log(`Call ${callId} ended (${reason})`);
		// Best effort: a call summary in the thread must never fail the ending.
		void this.postCallSystemMessage(call, reason, endedAt).catch((err) => {
			this.logger.warn(`Call ${callId} system message failed: ${err}`);
		});
		return { callId, reason, memberPeerIds };
	}

	/**
	 * Posts a SYSTEM summary into the conversation thread (missed/ended call)
	 * and broadcasts it over the existing message channels so thread views,
	 * previews, and unread counts update like any other message.
	 */
	private async postCallSystemMessage(
		call: {
			conversationId: string;
			type: "AUDIO" | "VIDEO";
			answeredAt: Date | null;
		},
		reason: CallEndReason,
		endedAt: Date,
	): Promise<void> {
		const kind = call.type === "VIDEO" ? "Video" : "Voice";
		let content: string;
		switch (reason) {
			case "COMPLETED": {
				const secs = call.answeredAt
					? Math.max(
							0,
							Math.round((endedAt.getTime() - call.answeredAt.getTime()) / 1000),
						)
					: 0;
				const mm = Math.floor(secs / 60);
				const ss = String(secs % 60).padStart(2, "0");
				content = `${kind} call ended · ${mm}:${ss}`;
				break;
			}
			case "MISSED":
				content = `Missed ${kind.toLowerCase()} call`;
				break;
			case "REJECTED":
				content = `${kind} call declined`;
				break;
			case "CANCELLED":
				content = `${kind} call cancelled`;
				break;
			default:
				content = `${kind} call failed`;
		}
		const result = await this.messageService.create(
			call.conversationId,
			{ content },
			"SYSTEM",
		);
		await this.widgetEvents.messageCreated({
			conversationId: call.conversationId,
			message: result.data,
		});
	}

	private async clearPresence(callId: string, peerIds: string[]): Promise<void> {
		await this.redis.del(callKey(callId));
		await this.redis.del(callParticipantsKey(callId));
		await this.redis.del(callMediaKey(callId));
		await this.redis.del(callRingKey(callId));
		for (const peerId of peerIds) {
			await this.redis.del(peerActiveCallKey(peerId));
		}
	}
}
