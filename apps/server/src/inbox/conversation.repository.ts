import { Injectable } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const conversationDetailInclude = {
	messages: {
		orderBy: { createdAt: "asc" },
		include: {
			replyTo: {
				select: {
					id: true,
					content: true,
					senderType: true,
					senderId: true,
				},
			},
		},
	},
} satisfies Prisma.ConversationInclude;

export type ConversationDetailRecord = Prisma.ConversationGetPayload<{
	include: typeof conversationDetailInclude;
}>;

/** All Prisma reads/writes for conversations live here — no Redis or event side effects. */
@Injectable()
export class ConversationRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findDetail(
		organizationId: string,
		conversationId: string,
	): Promise<ConversationDetailRecord | null> {
		return this.prisma.conversation.findFirst({
			where: { id: conversationId, organizationId, deletedAt: null },
			include: conversationDetailInclude,
		});
	}
}
