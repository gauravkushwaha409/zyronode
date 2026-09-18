import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WIDGET_SSE_EVENTS } from "../visitor/events/widget-event.types";
import { InboxSsePublisher } from "./inbox-sse.publisher";

function encodeNoteCursor(note: { createdAt: Date; id: string }): string {
	return Buffer.from(JSON.stringify({ createdAt: note.createdAt.toISOString(), id: note.id })).toString("base64url");
}

function decodeNoteCursor(cursor: string): { createdAt: Date; id: string } {
	try {
		const json = Buffer.from(cursor, "base64url").toString("utf-8");
		const parsed = JSON.parse(json) as { createdAt: string; id: string };
		if (!parsed.createdAt || !parsed.id) throw new Error("Invalid cursor payload");
		const createdAt = new Date(parsed.createdAt);
		if (Number.isNaN(createdAt.getTime())) throw new Error("Invalid cursor date");
		return { createdAt, id: parsed.id };
	} catch {
		throw new BadRequestException("Invalid cursor");
	}
}

/**
 * Internal notes are agent-only annotations on a conversation. Stored as
 * `Message` rows with `messageType: INTERNAL_NOTE`, `senderType: AGENT` —
 * never visible to the visitor widget, so events here go through
 * `InboxSsePublisher` (org/conversation agent-side keys only), never
 * `WidgetEventsPublisher`.
 */
@Injectable()
export class InternalNotesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly inboxSse: InboxSsePublisher,
	) {}

	private async assertConversationInOrg(organizationId: string, conversationId: string) {
		const conversation = await this.prisma.conversation.findFirst({
			where: { id: conversationId, organizationId, deletedAt: null },
			select: { id: true },
		});
		if (!conversation) {
			throw new NotFoundException("Conversation not found");
		}
	}

	async create(
		organizationId: string,
		conversationId: string,
		authorId: string,
		content: string,
		replyToId?: string,
	) {
		await this.assertConversationInOrg(organizationId, conversationId);

		const note = await this.prisma.message.create({
			data: {
				conversationId,
				senderType: "AGENT",
				senderId: authorId,
				messageType: "INTERNAL_NOTE",
				content,
				replyToId: replyToId ?? null,
			},
			include: {
				replyTo: {
					select: { id: true, content: true, senderType: true, senderId: true },
				},
			},
		});

		await this.inboxSse.emit(
			WIDGET_SSE_EVENTS.MESSAGE_CREATED,
			{ conversation: { id: conversationId }, message: note },
			{ organizationId, conversationId },
		);

		return {
			message: "Internal note created successfully",
			data: note,
		};
	}

	async findByConversation(
		organizationId: string,
		conversationId: string,
		filters?: { limit?: number; cursor?: string; direction?: "next" | "prev" },
	) {
		await this.assertConversationInOrg(organizationId, conversationId);

		const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
		const direction = filters?.direction ?? "next";
		const cursor = filters?.cursor;

		const baseWhere: Record<string, unknown> = { conversationId, messageType: "INTERNAL_NOTE" };
		let where: Record<string, unknown> = baseWhere;
		if (cursor) {
			const { createdAt: cursorDate, id: cursorId } = decodeNoteCursor(cursor);
			const cursorWhere =
				direction === "prev"
					? { OR: [{ createdAt: { gt: cursorDate } }, { createdAt: cursorDate, id: { gt: cursorId } }] }
					: { OR: [{ createdAt: { lt: cursorDate } }, { createdAt: cursorDate, id: { lt: cursorId } }] };
			where = { AND: [baseWhere, cursorWhere] };
		}

		const notesPlusOne = await this.prisma.message.findMany({
			where: where as never,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			include: {
				replyTo: {
					select: { id: true, content: true, senderType: true, senderId: true },
				},
			},
		});

		const hasExtra = notesPlusOne.length > limit;
		const notesDesc = hasExtra ? notesPlusOne.slice(0, limit) : notesPlusOne;
		const notes = [...notesDesc].reverse();

		return {
			message: "Internal notes fetched successfully",
			data: {
				notes,
				pagination: {
					limit,
					direction,
					cursor: cursor ?? null,
					nextCursor:
						direction === "next"
							? hasExtra
								? encodeNoteCursor(notesDesc[notesDesc.length - 1] as never)
								: null
							: notesDesc.length
								? encodeNoteCursor(notesDesc[notesDesc.length - 1] as never)
								: null,
					prevCursor:
						direction === "prev"
							? hasExtra
								? encodeNoteCursor(notesDesc[0] as never)
								: null
							: cursor && notesDesc.length
								? encodeNoteCursor(notesDesc[0] as never)
								: null,
					hasNext: direction === "next" ? hasExtra : notesDesc.length > 0,
					hasPrev: direction === "prev" ? hasExtra : !!cursor,
				},
			},
		};
	}
}
