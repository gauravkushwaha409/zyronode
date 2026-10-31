import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { RegisterPushTokenInput } from "./notifications.types";

type Owner =
	| { kind: "user"; userId: string }
	| { kind: "visitor"; visitorId: string; organizationId: string };

@Injectable()
export class PushTokensService {
	private readonly logger = new Logger(PushTokensService.name);

	constructor(private readonly prisma: PrismaService) {}

	async registerForUser(userId: string, input: RegisterPushTokenInput) {
		return this.register({ kind: "user", userId }, input);
	}

	async registerForVisitor(
		visitorId: string,
		organizationId: string,
		input: RegisterPushTokenInput,
	) {
		return this.register({ kind: "visitor", visitorId, organizationId }, input);
	}

	/**
	 * A token identifies one browser install, so an existing row is re-owned
	 * (e.g. a shared browser or a different account signing in) instead of
	 * creating duplicates or violating the unique constraint.
	 */
	private async register(owner: Owner, input: RegisterPushTokenInput) {
		const ownerFields =
			owner.kind === "user"
				? { userId: owner.userId, visitorId: null, organizationId: null }
				: {
						userId: null,
						visitorId: owner.visitorId,
						organizationId: owner.organizationId,
					};

		const data = {
			...ownerFields,
			isActive: true,
			lastUsedAt: new Date(),
			...(input.userAgent ? { userAgent: input.userAgent } : {}),
		};

		try {
			return await this.prisma.pushToken.upsert({
				where: { token: input.token },
				create: { token: input.token, ...data },
				update: data,
			});
		} catch (err) {
			// Concurrent registration of the same token can race the upsert.
			this.logger.warn(
				`Push token upsert raced; retrying as update: ${(err as Error).message}`,
			);
			return this.prisma.pushToken.update({
				where: { token: input.token },
				data,
			});
		}
	}

	async removeForUser(userId: string, token: string): Promise<void> {
		await this.prisma.pushToken.deleteMany({ where: { userId, token } });
	}

	async removeForVisitor(visitorId: string, token: string): Promise<void> {
		await this.prisma.pushToken.deleteMany({ where: { visitorId, token } });
	}

	async getTokensForUsers(userIds: string[]): Promise<string[]> {
		if (userIds.length === 0) return [];
		const rows = await this.prisma.pushToken.findMany({
			where: { userId: { in: userIds }, isActive: true },
			select: { token: true },
		});
		return rows.map((row) => row.token);
	}

	async getTokensForVisitors(visitorIds: string[]): Promise<string[]> {
		if (visitorIds.length === 0) return [];
		const rows = await this.prisma.pushToken.findMany({
			where: { visitorId: { in: visitorIds }, isActive: true },
			select: { token: true },
		});
		return rows.map((row) => row.token);
	}

	/** Called with tokens FCM rejected; delete them so we stop retrying. */
	async prune(tokens: string[]): Promise<void> {
		const uniqueTokens = [...new Set(tokens.filter(Boolean))];
		if (uniqueTokens.length === 0) return;
		await this.prisma.pushToken.deleteMany({
			where: { token: { in: uniqueTokens } },
		});
		this.logger.log(`Pruned ${uniqueTokens.length} invalid push token(s)`);
	}
}
