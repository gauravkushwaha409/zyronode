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
 * Endpoints (both public — widget has no JWT, identity is visitorId):
 *   GET /api/v1/widget/sse/visitor/:visitorId        -> text/event-stream (pre-conversation, visitor-scoped)
 *   GET /api/v1/widget/sse/:conversationId            -> text/event-stream (conversation-scoped, legacy)
 *   GET /api/v1/widget/sse/conversation/:conversationId -> text/event-stream (conversation-scoped, canonical)
 * Legacy: GET /api/v1/sse/visitor/conversation/:conversationId (sse.controller.ts)
 * remains for backward compat.
 */
@ApiTags("Widget SSE")
@Controller("widget/sse")
export class WidgetSseController {
	constructor(
		private readonly prisma: PrismaService,
		private readonly sse: SseService,
	) {}

	/**
	 * Visitor-scoped stream — open immediately after `POST /widget/organizations/:id/session`
	 * returns `{ visitor: { id } }`. No conversation required.
	 *
	 * Subscribes to `visitor:${visitorId}`. Useful to push welcome messages,
	 * agent-initiated prompts, visitor assignment, or any pre-conversation
	 * information via `SseService.publish([`visitor:${visitorId}`], event, data)`.
	 *
	 * Widget should open this as soon as visitorId is known and keep it open
	 * until conversation SSE takes over (or keep both).
	 */
	@Get("visitor/:visitorId")
	@ApiOperation({
		summary: "Widget SSE stream - scoped to a single visitor (public, pre-conversation)",
	})
	@ApiParam({ name: "visitorId", description: "Visitor ID (from session start)" })
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 404, description: "Visitor not found" })
	async visitorStream(
		@Param("visitorId") visitorId: string,
		@Res() res: Response,
	) {
		const visitor = await this.prisma.visitor.findFirst({
			where: { id: visitorId },
			select: { id: true },
		});
		if (!visitor) {
			throw new NotFoundException("Visitor not found");
		}

		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache, no-transform");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");
		res.flushHeaders?.();

		const clientId = this.sse.nextClientId();
		void this.sse.register({
			id: clientId,
			keys: new Set([`visitor:${visitorId}`]),
			write: (chunk) => res.write(chunk),
		});

		res.on("close", () => {
			this.sse.unregister(clientId);
		});
	}

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

	@Get("conversation/:conversationId")
	@ApiOperation({
		summary: "Widget SSE stream - scoped to a single conversation (public, canonical)",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async conversationStream(
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
