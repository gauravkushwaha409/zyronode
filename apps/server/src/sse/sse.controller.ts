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
import type { Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "./sse.service";

@Controller("sse-event")
export class SseController {
	constructor(
		private readonly sse: SseService,
		private readonly prisma: PrismaService,
	) {}

	/**
	 * Agent stream: receives every event for one organization (tenant).
	 * Auth: JWT via Authorization header or the `access` cookie
	 * (EventSource cannot set headers, so the cookie path is what the
	 * browser will actually use).
	 */
	@Get("agent")
	@UseGuards(JwtAuthGuard)
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

  /**
   * Visitor stream: public, but scoped strictly to a single conversation so
   * a visitor can never receive another tenant's events. No org id is
   * accepted from the client - it is always derived from the conversation row.
   */
  @Get("conversation/:conversationId")
  async visitorStream(
    @Param("conversationId") conversationId: string,
    @Res() res: Response,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
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
		// disable nginx buffering so events flush immediately
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
