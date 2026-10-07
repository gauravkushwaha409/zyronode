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
	WIDGET_SSE_EVENTS.CONVERSATION_CREATED,
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
	WIDGET_SSE_EVENTS.CONVERSATION_CREATED,
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

	/**
	 * Agent inbox SSE stream
	 * Send inbox event to agent
	 * @param organizationId
	 * @param userId
	 * @param res
	 */
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
		this.openStream(
			res,
			[SseKey.org(organizationId), SseKey.agent(organizationId)],
			INBOX_EVENTS,
		);
	}

	/**
	 * Agent visitor SSE stream - visitor events for one organization
	 * Send visitor event to agent
	 * @param organizationId
	 * @param userId
	 * @param res
	 */
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

	/**
	 * Visitor SSE stream - scoped to a single conversation
	 * Send conversation event to visitor in particular conversation
	 * @param conversationId
	 * @param res
	 */
	@Get("visitor/conversation/:conversationId")
	@ApiOperation({
		summary: "Visitor SSE stream - scoped to a single conversation",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiQuery({
		name: "visitorId",
		description: "Visitor ID owning the conversation (enables visitor-only key)",
		required: false,
	})
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async visitorStream(
		@Param("conversationId") conversationId: string,
		@Query("visitorId") visitorId: string | undefined,
		@Res() res: Response,
	) {
		const conversation = await this.prisma.conversation.findFirst({
			where: { id: conversationId, deletedAt: null },
			select: { id: true, visitorId: true },
		});
		if (!conversation) {
			throw new NotFoundException("Conversation not found");
		}
		if (visitorId && visitorId !== conversation.visitorId) {
			throw new ForbiddenException("visitorId does not match conversation");
		}

		const keys: string[] = [SseKey.conversation(conversationId)];
		if (visitorId) keys.push(SseKey.visitor(visitorId));

		this.openStream(res, keys, VISITOR_CONVERSATION_EVENTS);
	}

	/**
	 * Visitor SSE stream - scoped to a single visitor (public, pre-conversation)
	 * Send visitor event to visitor before conversation is created
	 * @param visitorId
	 * @param res
	 */
	@Get("visitor/:visitorId")
	@ApiOperation({
		summary:
			"Visitor SSE stream - scoped to a single visitor (public, pre-conversation)",
	})
	@ApiParam({
		name: "visitorId",
		description: "Visitor ID (from session start)",
	})
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 404, description: "Visitor not found" })
	async visitorStreamByVisitor(
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

		this.openStream(res, [SseKey.visitor(visitorId)]);
	}

	/**
	 * Opens an SSE stream for the given response, keys, and optional events.
	 * @param res
	 * @param keys
	 * @param events
	 */
	private openStream(res: Response, keys: string[], events?: Set<string>): void {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache, no-transform");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");
		res.flushHeaders?.();

		const clientId = this.sse.nextClientId();

		this.sse.register({
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
