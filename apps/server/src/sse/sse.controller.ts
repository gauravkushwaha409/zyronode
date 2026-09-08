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
import { SseService } from "./sse.service";

@ApiTags("SSE")
@Controller("sse-event")
export class SseController {
	constructor(
		private readonly sse: SseService,
		private readonly prisma: PrismaService,
	) {}

	@Get("agent")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "Agent SSE stream - receives events for one organization",
	})
	@ApiQuery({
		name: "organizationId",
		description: "Organization ID",
		required: true,
	})
	@ApiResponse({ status: 200, description: "SSE stream opened" })
	@ApiResponse({ status: 403, description: "Not a member of this organization" })
	async agentStream(
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
		this.openStream(res, [`org:${organizationId}`]);
	}

	@Get("visitor/:conversationId")
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

		this.openStream(res, [`conversation:${conversationId}`]);
	}

	private openStream(res: Response, keys: string[]): void {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache, no-transform");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");
		res.flushHeaders?.();

		const clientId = this.sse.nextClientId();

		void this.sse.register({
			id: clientId,
			keys: new Set(keys),
			write: (chunk) => res.write(chunk),
		});

		res.on("close", () => {
			this.sse.unregister(clientId);
		});
	}
}
