import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import {
	type CallEndReason,
	type CallPeerInfo,
	DEFAULT_CALL_MAX_PARTICIPANTS,
	DEFAULT_CALL_RING_TIMEOUT_SECONDS,
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
	userActiveCallKey,
} from "./keys";

export interface StartCallResult {
	call: Call;
	/** True when the invite merged into the other side's ringing call (glare). */
	merged: boolean;
	/** Invitees that were actually rung (busy/non-member users excluded). */
	rungUserIds: string[];
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
	/** Every userId that was part of the call (for room cleanup/notifies). */
	memberUserIds: string[];
}

/**
 * Owns call state. Postgres is the durable record; Redis holds ephemeral
 * presence (joined set, media flags, per-user active-call markers) with
 * TTLs as a backstop - all cleared explicitly on terminal transitions.
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

	/** A user may start or join a call only as a member of the conversation. */
	async requireConversationMember(
		userId: string,
		conversationId: string,
	): Promise<Conversation> {
		const conversation = await this.prisma.conversation.findUnique({
			where: { id: conversationId },
		});
		if (!conversation) throw new NotFoundException("Conversation not found");
		const membership = await this.prisma.organizationMember.findUnique({
			where: {
				userId_organizationId: {
					userId,
					organizationId: conversation.organizationId,
				},
			},
		});
		if (!membership) {
			throw new ForbiddenException("You are not a member of this conversation");
		}
		return conversation;
	}

	async getActiveCallId(userId: string): Promise<string | null> {
		return this.redis.get(userActiveCallKey(userId));
	}

	async startCall(
		starterId: string,
		conversationId: string,
		type: "AUDIO" | "VIDEO",
		inviteeIds: string[] | undefined,
	): Promise<StartCallResult> {
		const conversation = await this.requireConversationMember(
			starterId,
			conversationId,
		);
		const busy = await this.getActiveCallId(starterId);
		if (busy) {
			throw new ConflictException("You are already in a call");
		}

		// Default target: every other member of the conversation's org.
		let targets = inviteeIds?.filter((id) => id !== starterId) ?? [];
		if (targets.length === 0 && !inviteeIds) {
			const members = await this.prisma.organizationMember.findMany({
				where: { organizationId: conversation.organizationId },
				select: { userId: true },
			});
			targets = members
				.map((m) => m.userId)
				.filter((id) => id !== starterId)
				.slice(0, this.maxParticipants - 1);
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
		for (const targetId of targets) {
			const targetActiveId = await this.getActiveCallId(targetId);
			if (!targetActiveId) continue;
			const targetCall = await this.prisma.call.findUnique({
				where: { id: targetActiveId },
			});
			if (
				targetCall?.status === "RINGING" &&
				targetCall.conversationId === conversationId &&
				targetCall.startedById === targetId
			) {
				const join = await this.joinCall(starterId, targetCall.id);
				return { call: join.call, merged: true, rungUserIds: [], join };
			}
		}

		// Skip invitees who are busy or not members; fail if nobody is left.
		const rungUserIds: string[] = [];
		for (const targetId of targets) {
			const member = await this.prisma.organizationMember.findUnique({
				where: {
					userId_organizationId: {
						userId: targetId,
						organizationId: conversation.organizationId,
					},
				},
			});
			if (!member) continue;
			if (await this.getActiveCallId(targetId)) continue;
			rungUserIds.push(targetId);
		}
		if (rungUserIds.length === 0) {
			throw new ConflictException("Everyone you are calling is busy");
		}

		const call = await this.prisma.call.create({
			data: {
				conversationId,
				startedById: starterId,
				type,
				status: "RINGING",
				participants: {
					create: [
						{ userId: starterId, status: "JOINED", joinedAt: new Date() },
						...rungUserIds.map((userId) => ({ userId, status: "INVITED" as const })),
					],
				},
			},
		});

		const ringDeadline = Date.now() + this.ringTimeoutSeconds * 1000;
		await this.redis.hSet(callKey(call.id), "status", "RINGING");
		await this.redis.hSet(callKey(call.id), "conversationId", conversationId);
		await this.redis.hSet(callKey(call.id), "type", type);
		await this.redis.hSet(callKey(call.id), "ringDeadline", String(ringDeadline));
		await this.redis.sAdd(callParticipantsKey(call.id), starterId);
		await this.redis.hSet(
			callMediaKey(call.id),
			starterId,
			JSON.stringify({ audio: true, video: type === "VIDEO" }),
		);
		// Ring marker expires on its own; the gateway timer + lazy expiry below
		// handle the MISSED transition even if the scheduling instance dies.
		await this.redis.set(callRingKey(call.id), "1", this.ringTimeoutSeconds);
		await this.redis.set(
			userActiveCallKey(starterId),
			call.id,
			CALL_PRESENCE_TTL_SECONDS,
		);
		for (const userId of rungUserIds) {
			await this.redis.set(
				userActiveCallKey(userId),
				call.id,
				CALL_PRESENCE_TTL_SECONDS,
			);
		}

		return { call, merged: false, rungUserIds };
	}

	async joinCall(userId: string, callId: string): Promise<JoinCallResult> {
		const call = await this.getCall(callId);
		await this.requireConversationMember(userId, call.conversationId);
		const expired = await this.expireRingIfDue(call);
		if (expired) return { call, becameActive: false, peers: [], expired };

		const active = await this.getActiveCallId(userId);
		if (active && active !== callId) {
			throw new ConflictException("You are already in another call");
		}

		let participant = await this.prisma.callParticipant.findUnique({
			where: { callId_userId: { callId, userId } },
		});
		if (!participant) {
			// A conversation member may join a call they were not invited to
			// (group call), subject to the cap.
			const joined = await this.joinedCount(callId);
			if (joined >= this.maxParticipants) {
				throw new ConflictException(
					`Call is full (max ${this.maxParticipants} participants)`,
				);
			}
			participant = await this.prisma.callParticipant.create({
				data: { callId, userId, status: "JOINED", joinedAt: new Date() },
			});
		} else if (
			participant.status === "REJECTED" ||
			participant.status === "MISSED"
		) {
			throw new ConflictException("You cannot join this call anymore");
		} else if (participant.status !== "JOINED") {
			const joined = await this.joinedCount(callId);
			if (joined >= this.maxParticipants) {
				throw new ConflictException(
					`Call is full (max ${this.maxParticipants} participants)`,
				);
			}
			participant = await this.prisma.callParticipant.update({
				where: { id: participant.id },
				data: { status: "JOINED", joinedAt: new Date(), leftAt: null },
			});
		}

		await this.redis.set(
			userActiveCallKey(userId),
			callId,
			CALL_PRESENCE_TTL_SECONDS,
		);
		await this.redis.sAdd(callParticipantsKey(callId), userId);

		let becameActive = false;
		let updated = call;
		if (call.status === "RINGING") {
			// First invitee join flips RINGING -> ACTIVE.
			const joinedIds = await this.redis.sMembers(callParticipantsKey(callId));
			const othersJoined = joinedIds.some((id) => id !== call.startedById);
			if (othersJoined || participant.userId !== call.startedById) {
				updated = await this.prisma.call.update({
					where: { id: callId },
					data: { status: "ACTIVE", answeredAt: new Date() },
				});
				await this.redis.hSet(callKey(callId), "status", "ACTIVE");
				await this.redis.del(callRingKey(callId));
				becameActive = true;
			}
		}
		const peers = await this.getPeers(callId, userId);
		return { call: updated, becameActive, peers };
	}

	async rejectCall(
		userId: string,
		callId: string,
	): Promise<EndCallResult | null> {
		const call = await this.getCall(callId);
		const expired = await this.expireRingIfDue(call);
		if (expired) return expired;
		const participant = await this.prisma.callParticipant.findUnique({
			where: { callId_userId: { callId, userId } },
		});
		if (participant?.status !== "INVITED") {
			throw new ConflictException("Nothing to reject");
		}
		await this.prisma.callParticipant.update({
			where: { id: participant.id },
			data: { status: "REJECTED" },
		});
		await this.redis.del(userActiveCallKey(userId));

		// Nobody left to ring and nobody joined -> ENDED(REJECTED).
		// (The starter alone waiting goes MISSED via the ring timeout.)
		const [stillInvited, joinedOthers] = await Promise.all([
			this.prisma.callParticipant.count({ where: { callId, status: "INVITED" } }),
			this.prisma.callParticipant.count({
				where: { callId, status: "JOINED", userId: { not: call.startedById } },
			}),
		]);
		if (stillInvited === 0 && joinedOthers === 0) {
			return this.endCall(callId, "REJECTED");
		}
		return null;
	}

	async leaveCall(
		userId: string,
		callId: string,
	): Promise<EndCallResult | null> {
		const call = await this.getCall(callId);
		const expired = await this.expireRingIfDue(call);
		if (expired) return expired;
		const participant = await this.prisma.callParticipant.findUnique({
			where: { callId_userId: { callId, userId } },
		});
		if (participant?.status !== "JOINED") {
			throw new ConflictException("You are not in this call");
		}
		await this.prisma.callParticipant.update({
			where: { id: participant.id },
			data: { status: "LEFT", leftAt: new Date() },
		});
		await this.redis.sRem(callParticipantsKey(callId), userId);
		await this.redis.hDel(callMediaKey(callId), userId);
		await this.redis.del(userActiveCallKey(userId));

		// The call ends when the last joined participant leaves.
		const stillJoined = await this.prisma.callParticipant.count({
			where: { callId, status: "JOINED" },
		});
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
	async assertCanRelay(from: string, callId: string, to: string): Promise<void> {
		const call = await this.getCall(callId);
		const expired = await this.expireRingIfDue(call);
		if (expired) throw new ConflictException("Call already ended");
		if (call.status !== "ACTIVE") {
			throw new ConflictException("Call is not active");
		}
		const rows = await this.prisma.callParticipant.findMany({
			where: { callId, userId: { in: [from, to] } },
			select: { userId: true, status: true },
		});
		const byUser = new Map(rows.map((r) => [r.userId, r.status]));
		if (byUser.get(from) !== "JOINED") {
			throw new ForbiddenException("You are not in this call");
		}
		if (byUser.get(to) !== "JOINED") {
			throw new ForbiddenException("Target is not in this call");
		}
	}

	async setMediaState(
		userId: string,
		callId: string,
		audio: boolean,
		video: boolean,
	): Promise<void> {
		const call = await this.getCallOrThrow(callId);
		if (call.status !== "ACTIVE") {
			throw new ConflictException("Call is not active");
		}
		const participant = await this.prisma.callParticipant.findUnique({
			where: { callId_userId: { callId, userId } },
		});
		if (participant?.status !== "JOINED") {
			throw new ForbiddenException("You are not in this call");
		}
		await this.redis.hSet(
			callMediaKey(callId),
			userId,
			JSON.stringify({ audio, video }),
		);
	}

	async getPeers(
		callId: string,
		exceptUserId?: string,
	): Promise<CallPeerInfo[]> {
		const joinedIds = await this.redis.sMembers(callParticipantsKey(callId));
		const media = await this.redis.hGetAll(callMediaKey(callId));
		const peers: CallPeerInfo[] = [];
		for (const id of joinedIds) {
			if (id === exceptUserId) continue;
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
			peers.push({ userId: id, audio, video });
		}
		return peers;
	}

	async getCallHistory(
		userId: string,
		conversationId: string,
		cursor: string | undefined,
		limit: number,
	) {
		await this.requireConversationMember(userId, conversationId);
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

	private async getCallOrThrow(callId: string): Promise<Call> {
		const call = await this.prisma.call.findUnique({ where: { id: callId } });
		if (!call) throw new NotFoundException("Call not found");
		return call;
	}

	/** Public read for the gateway (join-sync and lazy-expiry paths). */
	async getCall(callId: string): Promise<Call> {
		return this.getCallOrThrow(callId);
	}

	/** Gateway entry for timer-driven and pre-operation lazy expiry. */
	async expireCallIfDueById(callId: string): Promise<EndCallResult | null> {
		const call = await this.prisma.call.findUnique({ where: { id: callId } });
		if (!call) return null;
		return this.expireRingIfDue(call);
	}

	private async joinedCount(callId: string): Promise<number> {
		return this.prisma.callParticipant.count({
			where: { callId, status: "JOINED" },
		});
	}

	/** Terminal transition: persists ENDED + statuses, clears all presence. */
	private async endCall(
		callId: string,
		reason: CallEndReason,
	): Promise<EndCallResult> {
		const call = await this.prisma.call.findUnique({
			where: { id: callId },
			include: {
				participants: { select: { id: true, userId: true, status: true } },
			},
		});
		if (!call) {
			await this.clearPresence(callId, []);
			return { callId, reason, memberUserIds: [] };
		}
		const participants = call.participants;
		const memberUserIds = participants.map((p) => p.userId);
		if (call.status === "ENDED") {
			// Already terminal (race between timer and lazy expiry) - still
			// ensure presence is gone, then report the original outcome.
			await this.clearPresence(callId, memberUserIds);
			return { callId, reason: call.endReason ?? reason, memberUserIds };
		}
		for (const p of participants) {
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
		await this.clearPresence(callId, memberUserIds);
		this.logger.log(`Call ${callId} ended (${reason})`);
		// Best effort: a call summary in the thread must never fail the ending.
		void this.postCallSystemMessage(call, reason, endedAt).catch((err) => {
			this.logger.warn(`Call ${callId} system message failed: ${err}`);
		});
		return { callId, reason, memberUserIds };
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

	private async clearPresence(callId: string, userIds: string[]): Promise<void> {
		await this.redis.del(callKey(callId));
		await this.redis.del(callParticipantsKey(callId));
		await this.redis.del(callMediaKey(callId));
		await this.redis.del(callRingKey(callId));
		for (const userId of userIds) {
			await this.redis.del(userActiveCallKey(userId));
		}
	}
}
