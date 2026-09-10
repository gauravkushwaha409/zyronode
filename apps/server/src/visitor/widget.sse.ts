import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "../sse/sse.service";

/**
 * Dedicated SSE controller for the widget.
 * Segregated from WidgetController (normal HTTP) so streaming concerns
 * (headers, keep-alive, register/unregister) live in isolation.
 *
 * Single endpoint (canonical widget SSE):
 *   GET /api/v1/widget/sse/:conversationId -> text/event-stream
 * Legacy: GET /api/v1/sse-event/visitor/:conversationId (sse.controller.ts)
 * remains for backward compat.
 */
@ApiTags("Widget")
@Controller("widget/sse")
export class WidgetSseController {
	constructor(
		private readonly prisma: PrismaService,
		private readonly sse: SseService,
	) {}

	@Get(":conversationId")
	@ApiOperation({
		summary: "Widget SSE stream - scoped to a single conversation (public)",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async stream(
		@Param("conversationId") conversationId: string,
		@Res() res: Response,
	) {
		const conversation = await this.prisma.conversation.findFirst({
			where: { id: conversationId, deletedAt: null },
			select: { id: true },
		});
		if (!conversation) {
			throw new NotFoundException("Conversation not found");
		}

		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache, no-transform");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");
		res.flushHeaders?.();

		const clientId = this.sse.nextClientId();
		void this.sse.register({
			id: clientId,
			keys: new Set([`conversation:${conversationId}`]),
			write: (chunk) => res.write(chunk),
		});

		res.on("close", () => {
			this.sse.unregister(clientId);
		});
	}
}
