import {
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	Query,
	Res,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { WIDGET_SSE_EVENTS } from "../visitor/events/widget-event.types";
import { SseKey } from "./keys";
import { SseService } from "./sse.service";

// Role-first, module-second scoping: each route only delivers its module's events.
// Inbox needs conversation presence to show visitor online in conversation list.
const INBOX_EVENTS = new Set([
	WIDGET_SSE_EVENTS.MESSAGE_CREATED,
	WIDGET_SSE_EVENTS.CONVERSATION_UPDATED,
	WIDGET_SSE_EVENTS.CONVERSATION_PRESENCE,
]);
const AGENT_VISITOR_EVENTS = new Set([
	WIDGET_SSE_EVENTS.VISITOR_CREATED,
	WIDGET_SSE_EVENTS.VISITOR_UPDATED,
	WIDGET_SSE_EVENTS.VISITOR_ASSIGNED,
	WIDGET_SSE_EVENTS.VISITOR_NOTE_CREATED,
	WIDGET_SSE_EVENTS.VISITOR_CONNECTED,
	WIDGET_SSE_EVENTS.VISITOR_DISCONNECTED,
	WIDGET_SSE_EVENTS.CONVERSATION_UPDATED,
]);
const VISITOR_CONVERSATION_EVENTS = new Set([
	WIDGET_SSE_EVENTS.MESSAGE_CREATED,
	WIDGET_SSE_EVENTS.CONVERSATION_UPDATED,
]);

@ApiTags("SSE")
@Controller("sse")
export class SseController {
	constructor(
		private readonly sse: SseService,
		private readonly prisma: PrismaService,
	) {}

	@Get("agent/inbox")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "Agent inbox SSE stream - messaging events for one organization",
	})
	@ApiQuery({
		name: "organizationId",
		description: "Organization ID",
		required: true,
	})
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 403, description: "Not a member of this organization" })
	async agentInboxStream(
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
		@Res() res: Response,
	) {
		if (!organizationId) {
			throw new ForbiddenException("organizationId query param is required");
		}

		const membership = await this.prisma.organizationMember.findUnique({
			where: {
				userId_organizationId: { userId, organizationId },
			},
		});
		if (!membership) {
			throw new ForbiddenException("You are not a member of this organization");
		}
		this.openStream(res, [SseKey.org(organizationId)], INBOX_EVENTS);
	}

	@Get("agent/visitor")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "Agent visitor SSE stream - visitor events for one organization",
	})
	@ApiQuery({
		name: "organizationId",
		description: "Organization ID",
		required: true,
	})
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 403, description: "Not a member of this organization" })
	async agentVisitorStream(
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
		@Res() res: Response,
	) {
		if (!organizationId) {
			throw new ForbiddenException("organizationId query param is required");
		}

		const membership = await this.prisma.organizationMember.findUnique({
			where: {
				userId_organizationId: { userId, organizationId },
			},
		});
		if (!membership) {
			throw new ForbiddenException("You are not a member of this organization");
		}
		this.openStream(res, [SseKey.org(organizationId)], AGENT_VISITOR_EVENTS);
	}

	@Get("visitor/conversation/:conversationId")
	@ApiOperation({
		summary: "Visitor SSE stream - scoped to a single conversation",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async visitorStream(
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

		this.openStream(
			res,
			[SseKey.conversation(conversationId)],
			VISITOR_CONVERSATION_EVENTS,
		);
	}

	private openStream(res: Response, keys: string[], events?: Set<string>): void {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache, no-transform");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");
		res.flushHeaders?.();

		const clientId = this.sse.nextClientId();

		void this.sse.register({
			id: clientId,
			keys: new Set(keys),
			events,
			write: (chunk) => res.write(chunk),
		});

		res.on("close", () => {
			this.sse.unregister(clientId);
		});
	}
}
