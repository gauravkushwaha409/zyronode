import { randomUUID } from "node:crypto";
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { SseService } from "../sse/sse.service";
import type { ListVisitorsDto } from "./dto/list-visitors.dto";
import type { StartVisitorSessionDto } from "./dto/start-visitor-session.dto";
import type { CreateVisitorNoteDto } from "./dto/update-visitor.dto";
import type {
	AssignVisitorAgentDto,
	UpdateVisitorDetailsDto,
} from "./dto/update-visitor-details.dto";

const DEFAULT_LIMIT = 25;

/**
 * A visitor counts as online only if a presence heartbeat landed inside this
 * window. Authority for "online" is the Redis sorted set below, not the
 * Visitor.isOnline/lastSeenAt columns - those are best-effort history only
 * (analytics, "last seen" display), since nothing keeps them fresh once a
 * browser dies without an explicit disconnect.
 */
const ONLINE_WINDOW_MS = 60_000;

/** ZSET per org: member = visitorId, score = last heartbeat epoch ms. */
const onlinePresenceKey = (organizationId: string) =>
	`visitor-presence:${organizationId}`;

const VISITOR_LIST_SELECT = {
	id: true,
	externalId: true,
	name: true,
	email: true,
	phone: true,
	ipAddress: true,
	status: true,
	visitCount: true,
	isIdentified: true,
	isOnline: true,
	currentPage: true,
	activeDuration: true,
	lastSeenAt: true,
	device: true,
	deviceType: true,
	browser: true,
	os: true,
	country: true,
	countryCode: true,
	city: true,
	region: true,
	regionName: true,
	timezone: true,
	latitude: true,
	longitude: true,
	assignedAgentId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.VisitorSelect;

@Injectable()
export class VisitorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly sse: SseService,
		private readonly redis: RedisService,
	) {}

	/**
	 * Every read/write goes through this so a visitor id from the URL can
	 * never be used to reach another tenant's row.
	 */
	private async assertMembership(userId: string, organizationId: string) {
		const membership = await this.prisma.organizationMember.findUnique({
			where: { userId_organizationId: { userId, organizationId } },
		});
		if (!membership) {
			throw new ForbiddenException({
				message: "You are not a member of this organization",
				error_code: "NOT_ORGANIZATION_MEMBER",
			});
		}
	}

	private async assertVisitorInOrg(visitorId: string, organizationId: string) {
		const visitor = await this.prisma.visitor.findFirst({
			where: { id: visitorId, organizationId },
			select: { id: true },
		});
		if (!visitor) {
			throw new NotFoundException({
				message: "Visitor not found",
				error_code: "VISITOR_NOT_FOUND",
			});
		}
	}

	private onlineCutoffMs() {
		return Date.now() - ONLINE_WINDOW_MS;
	}

	/** Visitor ids with a live heartbeat, straight from Redis - the source of truth for "online". */
	private async getOnlineVisitorIds(organizationId: string): Promise<Set<string>> {
		const ids = await this.redis.zRangeByScore(
			onlinePresenceKey(organizationId),
			this.onlineCutoffMs(),
		);
		console.log("online visitor ids", ids);
		return new Set(ids);
	}

	private buildWhere(
		organizationId: string,
		query: ListVisitorsDto,
	): Prisma.VisitorWhereInput {
		const where: Prisma.VisitorWhereInput = { organizationId };

		if (query.country) where.country = query.country;
		if (query.deviceType) where.deviceType = query.deviceType;

		if (query.search) {
			where.AND = [
				{
					OR: [
						{ name: { contains: query.search, mode: "insensitive" } },
						{ email: { contains: query.search, mode: "insensitive" } },
						{ ipAddress: { contains: query.search, mode: "insensitive" } },
					],
				},
			];
		}

		return where;
	}

	/** Overrides the stale isOnline column with the Redis-derived truth. */
	private withDerivedPresence<T extends { id: string; isOnline: boolean }>(
		visitor: T,
		onlineIds: Set<string>,
	) {
		return { ...visitor, isOnline: onlineIds.has(visitor.id) };
	}

	/**
	 * Called by VisitorGateway on every presence heartbeat, after it has
	 * verified visitorId belongs to organizationId. Redis holds the live
	 * "online" truth (score = this heartbeat's epoch ms); the DB write is
	 * throttled so a heartbeat every few seconds doesn't hit Postgres every
	 * few seconds too - lastSeenAt/isOnline here are history, not authority.
	 */
	async recordPresenceHeartbeat(
		organizationId: string,
		visitorId: string,
		fields: { currentPage?: string; activeDuration?: number },
	): Promise<void> {
		const key = onlinePresenceKey(organizationId);
		const now = Date.now();
		const previousScore = await this.redis.zScore(key, visitorId);
		await this.redis.zAdd(key, now, visitorId);

		const DB_WRITE_THROTTLE_MS = 30_000;
		if (previousScore !== null && now - previousScore < DB_WRITE_THROTTLE_MS) {
			return;
		}

		await this.prisma.visitor.update({
			where: { id: visitorId },
			data: {
				isOnline: true,
				lastSeenAt: new Date(now),
				...(fields.currentPage !== undefined
					? { currentPage: fields.currentPage }
					: {}),
				...(fields.activeDuration !== undefined
					? { activeDuration: fields.activeDuration }
					: {}),
			},
		});
	}

	/** Called by VisitorGateway on an explicit "visitor left" signal. */
	async recordPresenceOffline(
		organizationId: string,
		visitorId: string,
	): Promise<void> {
		await this.redis.zRem(onlinePresenceKey(organizationId), visitorId);
		const visitor = await this.prisma.visitor.update({
			where: { id: visitorId },
			data: { isOnline: false, lastSeenAt: new Date() },
			select: { id: true, externalId: true },
		});
		void this.sse.publish([`org:${organizationId}`], "visitor.disconnected", {
			visitorId: visitor.id,
			externalId: visitor.externalId,
			isOnline: false,
		});
	}

	/**
	 * Gateway trust boundary: a visitorId off the wire is never joined to a
	 * room or written into an org's presence set until this confirms it
	 * actually belongs to the claimed organizationId.
	 */
	async verifyVisitorMembership(
		visitorId: string,
		organizationId: string,
	): Promise<boolean> {
		const visitor = await this.prisma.visitor.findFirst({
			where: { id: visitorId, organizationId },
			select: { id: true },
		});
		return visitor !== null;
	}

	/**
	 * Starts (or resumes) a visitor session.
	 *
	 * The browser's identity lives in an httpOnly cookie. The cookie value is
	 * stored as the visitor's externalId (unique per organization), so:
	 * - cookie present + row exists  -> same visitor returns, visitCount bumps
	 * - cookie present + row missing -> same token reused for a fresh row
	 * - cookie removed (manual)      -> new token => a brand-new visitor row
	 */
	async startSession(
		organizationId: string,
		ipAddress: string | undefined,
		existingSessionId: string | undefined,
		dto: StartVisitorSessionDto,
	) {
		const organization = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!organization) {
			throw new NotFoundException({
				message: "Organization not found",
				error_code: "ORGANIZATION_NOT_FOUND",
			});
		}

		const sessionId = existingSessionId ?? randomUUID();

		const existing = await this.prisma.visitor.findFirst({
			where: { organizationId, externalId: sessionId },
			select: VISITOR_LIST_SELECT,
		});

		if (existing) {
			const visitor = await this.prisma.visitor.update({
				where: { id: existing.id },
				data: {
					isOnline: true,
					lastSeenAt: new Date(),
					visitCount: { increment: 1 },
					...(ipAddress ? { ipAddress } : {}),
					...(dto.sourceUrl ? { sourceUrl: dto.sourceUrl } : {}),
				},
				select: VISITOR_LIST_SELECT,
			});
			await this.redis.zAdd(onlinePresenceKey(organizationId), Date.now(), visitor.id);
			void this.sse.publish([`org:${organizationId}`], "visitor.connected", {
				visitorId: visitor.id,
				externalId: visitor.externalId,
				isOnline: true,
			});
			return { visitor, sessionId };
		}

		// upsert (not create) so a concurrent request racing on the same token
		// can never blow up the (organizationId, externalId) unique index.
		const visitor = await this.prisma.visitor.upsert({
			where: {
				organizationId_externalId: { organizationId, externalId: sessionId },
			},
			create: {
				organizationId,
				externalId: sessionId,
				sourceUrl: dto.sourceUrl ?? undefined,
				ipAddress: ipAddress ?? undefined,
				isOnline: true,
				lastSeenAt: new Date(),
			},
			update: {
				isOnline: true,
				lastSeenAt: new Date(),
				...(ipAddress ? { ipAddress } : {}),
				...(dto.sourceUrl ? { sourceUrl: dto.sourceUrl } : {}),
			},
			select: VISITOR_LIST_SELECT,
		});

		await this.redis.zAdd(onlinePresenceKey(organizationId), Date.now(), visitor.id);

		void this.sse.publish([`org:${organizationId}`], "visitor.created", {
			visitor,
		});
		void this.sse.publish([`org:${organizationId}`], "visitor.connected", {
			visitorId: visitor.id,
			isOnline: true,
		});

		return { visitor, sessionId };
	}

	/**
	 * 
	 * Visitor List
	 * @param userId 
	 * @param organizationId 
	 * @param query 
	 * @returns 
	 */
	async list(userId: string, organizationId: string, query: ListVisitorsDto) {
		await this.assertMembership(userId, organizationId);

		const limit = query.limit ?? DEFAULT_LIMIT;
		const where = this.buildWhere(organizationId, query);
		const onlineIds = await this.getOnlineVisitorIds(organizationId);

		if (query.isOnline === true) {
			where.id = { in: [...onlineIds] };
		} else if (query.isOnline === false) {
			where.id = { notIn: [...onlineIds] };
		}

		const [rows, total] = await Promise.all([
			this.prisma.visitor.findMany({
				where,
				// take one extra to detect another page without a second count
				take: limit + 1,
				...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
				orderBy: [{ lastSeenAt: "desc" }, { id: "desc" }],
				select: {
					...VISITOR_LIST_SELECT,
					conversations: {
						select: { id: true },
						orderBy: { updatedAt: "desc" },
						take: 5,
					},
				},
			}),
			this.prisma.visitor.count({ where }),
		]);

		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;

		return {
			message: "Visitors fetched successfully",
			data: {
				data: page.map((row) => this.withDerivedPresence(row, onlineIds)),
				total,
				nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
				hasMore,
			},
		};
	}

	async info(userId: string, organizationId: string, visitorId: string) {
		await this.assertMembership(userId, organizationId);

		const visitor = await this.prisma.visitor.findFirst({
			where: { id: visitorId, organizationId },
			select: {
				...VISITOR_LIST_SELECT,
				sourceUrl: true,
				utmSource: true,
				utmMedium: true,
				utmCampaign: true,
				assignedAgent: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						profile: true,
					},
				},
				conversations: {
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						status: true,
						channel: true,
						createdAt: true,
						updatedAt: true,
						_count: { select: { messages: true } },
						messages: {
							orderBy: { createdAt: "desc" },
							take: 1,
							select: {
								content: true,
								senderType: true,
								createdAt: true,
							},
						},
					},
				},
				pageVisits: {
					orderBy: { enteredAt: "desc" },
					take: 50,
					select: {
						id: true,
						url: true,
						pageTitle: true,
						enteredAt: true,
						leftAt: true,
						durationSeconds: true,
					},
				},
				notes: {
					orderBy: { createdAt: "desc" },
					select: {
						id: true,
						content: true,
						createdAt: true,
						author: {
							select: { id: true, firstName: true, lastName: true, email: true },
						},
					},
				},
			},
		});

		if (!visitor) {
			throw new NotFoundException({
				message: "Visitor not found",
				error_code: "VISITOR_NOT_FOUND",
			});
		}

		const { conversations, ...rest } = visitor;
		const score = await this.redis.zScore(
			onlinePresenceKey(organizationId),
			visitorId,
		);
		const isOnline = score !== null && score >= this.onlineCutoffMs();

		return {
			message: "Visitor fetched successfully",
			data: {
				...rest,
				isOnline,
				conversations: conversations.map(
					({ _count, messages, ...conversation }) => ({
						...conversation,
						messageCount: _count.messages,
						lastMessage: messages[0] ?? null,
					}),
				),
			},
		};
	}

	async updateDetails(
		userId: string,
		organizationId: string,
		visitorId: string,
		dto: UpdateVisitorDetailsDto,
	) {
		await this.assertMembership(userId, organizationId);
		await this.assertVisitorInOrg(visitorId, organizationId);

		const updated = await this.prisma.visitor.update({
			where: { id: visitorId },
			data: {
				...(dto.name !== undefined ? { name: dto.name } : {}),
				...(dto.email !== undefined ? { email: dto.email } : {}),
				...(dto.phone !== undefined ? { phone: dto.phone } : {}),
				...(dto.status !== undefined ? { status: dto.status } : {}),
				// any agent-supplied identity means we now know who this is
				...(dto.name || dto.email ? { isIdentified: true } : {}),
			},
			select: VISITOR_LIST_SELECT,
		});

		// persisted -> SSE
		void this.sse.publish([`org:${organizationId}`], "visitor.updated", {
			visitor: updated,
		});

		return {
			message: "Visitor updated successfully",
			data: updated,
		};
	}

	async assignAgent(
		userId: string,
		organizationId: string,
		visitorId: string,
		dto: AssignVisitorAgentDto,
	) {
		await this.assertMembership(userId, organizationId);
		await this.assertVisitorInOrg(visitorId, organizationId);

		// the assignee must belong to this org too
		if (dto.agentId) {
			await this.assertMembership(dto.agentId, organizationId);
		}

		const updated = await this.prisma.visitor.update({
			where: { id: visitorId },
			data: { assignedAgentId: dto.agentId ?? null },
			select: {
				...VISITOR_LIST_SELECT,
				assignedAgent: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						profile: true,
					},
				},
			},
		});

		void this.sse.publish([`org:${organizationId}`], "visitor.assigned", {
			visitor: updated,
		});

		return {
			message: dto.agentId
				? "Visitor assigned successfully"
				: "Visitor unassigned successfully",
			data: updated,
		};
	}

	async listNotes(userId: string, organizationId: string, visitorId: string) {
		await this.assertMembership(userId, organizationId);
		await this.assertVisitorInOrg(visitorId, organizationId);

		const notes = await this.prisma.visitorNote.findMany({
			where: { visitorId },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: { id: true, firstName: true, lastName: true, email: true },
				},
			},
		});

		return {
			message: "Visitor notes fetched successfully",
			data: notes,
		};
	}

	async createNote(
		userId: string,
		organizationId: string,
		visitorId: string,
		dto: CreateVisitorNoteDto,
	) {
		await this.assertMembership(userId, organizationId);
		await this.assertVisitorInOrg(visitorId, organizationId);

		const note = await this.prisma.visitorNote.create({
			data: { visitorId, authorId: userId, content: dto.content },
			select: {
				id: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: { id: true, firstName: true, lastName: true, email: true },
				},
			},
		});

		void this.sse.publish([`org:${organizationId}`], "visitor.note.created", {
			visitorId,
			note,
		});

		return {
			message: "Visitor note created successfully",
			data: note,
		};
	}

	async statCards(userId: string, organizationId: string) {
		await this.assertMembership(userId, organizationId);

		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		const [online, today, identified, total, durationAgg] = await Promise.all([
			this.redis.zCountByScore(
				onlinePresenceKey(organizationId),
				this.onlineCutoffMs(),
			),
			this.prisma.visitor.count({
				where: { organizationId, createdAt: { gte: startOfToday } },
			}),
			this.prisma.visitor.count({
				where: { organizationId, isIdentified: true },
			}),
			this.prisma.visitor.count({ where: { organizationId } }),
			this.prisma.visitor.aggregate({
				where: { organizationId },
				_avg: { activeDuration: true },
			}),
		]);

		return {
			message: "Visitor stats fetched successfully",
			data: {
				online,
				today,
				identified,
				total,
				avgActiveDuration: Math.round(durationAgg._avg.activeDuration ?? 0),
			},
		};
	}

	async byCountry(userId: string, organizationId: string) {
		await this.assertMembership(userId, organizationId);

		const grouped = await this.prisma.visitor.groupBy({
			by: ["country", "countryCode"],
			where: { organizationId, country: { not: null } },
			_count: { _all: true },
			orderBy: { _count: { id: "desc" } },
			take: 50,
		});

		const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

		return {
			message: "Visitor countries fetched successfully",
			data: {
				countries: grouped.map((row) => ({
					country: row.country as string,
					countryCode: row.countryCode,
					count: row._count._all,
					percentage: total ? Math.round((row._count._all / total) * 1000) / 10 : 0,
				})),
				total,
			},
		};
	}

	async topPages(userId: string, organizationId: string) {
		await this.assertMembership(userId, organizationId);

		const grouped = await this.prisma.visitorPageVisit.groupBy({
			by: ["url"],
			where: { visitor: { organizationId } },
			_count: { _all: true },
			orderBy: { _count: { url: "desc" } },
			take: 20,
		});

		const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

		return {
			message: "Top pages fetched successfully",
			data: {
				pages: grouped.map((row) => ({
					url: row.url,
					count: row._count._all,
					percentage: total ? Math.round((row._count._all / total) * 1000) / 10 : 0,
				})),
				total,
			},
		};
	}

	/** Distinct countries present for this org - powers the table's filter. */
	async countryOptions(userId: string, organizationId: string) {
		await this.assertMembership(userId, organizationId);

		const rows = await this.prisma.visitor.findMany({
			where: { organizationId, country: { not: null } },
			distinct: ["country"],
			select: { country: true, countryCode: true },
			orderBy: { country: "asc" },
		});

		return {
			message: "Visitor country options fetched successfully",
			data: rows,
		};
	}
}
