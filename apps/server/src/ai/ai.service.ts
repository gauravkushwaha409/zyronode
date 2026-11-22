import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { buildRewriteMessages, buildSuggestReplyMessages } from "./ai.prompts";
import type { AiAction } from "./ai.types";
import { OpenRouterClient } from "./openrouter.client";

const MAX_TRANSCRIPT_CHARS = 6000;
const MAX_MESSAGE_CHARS = 2000;

function toPlainText(value: string): string {
	return value
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li)>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/[ \t]+/g, " ")
		.replace(/\n{2,}/g, "\n")
		.trim()
		.slice(0, MAX_MESSAGE_CHARS);
}

@Injectable()
export class AiService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly client: OpenRouterClient,
	) {}

	async rewrite(text: string, action: AiAction) {
		const draft = text.trim();
		if (!draft) {
			throw new BadRequestException("Text is required");
		}
		const result = await this.client.chat(buildRewriteMessages(draft, action));
		return { text: result.text };
	}

	async suggestReply(conversationId: string, organizationId: string) {
		const conversation = await this.prisma.conversation.findFirst({
			where: { id: conversationId, organizationId, deletedAt: null },
			select: { id: true },
		});
		if (!conversation) {
			throw new NotFoundException("Conversation not found");
		}

		const take = Math.min(
			Math.max(Number(process.env.AI_MAX_HISTORY_MESSAGES) || 6, 1),
			20,
		);
		const rows = await this.prisma.message.findMany({
			where: {
				conversationId,
				deletedAt: null,
				messageType: { not: "INTERNAL_NOTE" },
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take,
			select: { senderType: true, content: true },
		});
		if (!rows.length) {
			throw new BadRequestException("There are no messages to base a reply on");
		}

		const transcript = rows
			.reverse()
			.map((row) => {
				const author = row.senderType === "VISITOR" ? "Visitor" : "Agent";
				return `${author}: ${toPlainText(row.content)}`;
			})
			.join("\n")
			.slice(-MAX_TRANSCRIPT_CHARS);

		const result = await this.client.chat(buildSuggestReplyMessages(transcript), {
			maxTokens: 400,
		});
		return { text: result.text };
	}
}
