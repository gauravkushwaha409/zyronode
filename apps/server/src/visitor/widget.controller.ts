import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Req,
	Res,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { ConversationService } from "../inbox/conversation.service";
import { CreateConversationDto } from "../inbox/dto/create-conversation.dto";
import { ListMessagesDto } from "../message/dto/list-messages.dto";
import { SendMessageDto } from "../message/dto/send-message.dto";
import { MessageService } from "../message/message.service";
import { StartVisitorSessionDto } from "./dto/start-visitor-session.dto";
import { WidgetEventsPublisher } from "./events/widget-events.publisher";
import { VISITOR_SESSION_COOKIE } from "./visitor.controller";
import { VisitorService } from "./visitor.service";

const VISITOR_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@ApiTags("Widget")
@Controller("widget")
export class WidgetController {
	constructor(
		private readonly visitorService: VisitorService,
		private readonly conversationService: ConversationService,
		private readonly messageService: MessageService,
		private readonly widgetEvents: WidgetEventsPublisher,
	) {}

	/**
	 * Public - widget entry point. Mirrors POST /organizations/:id/visitors/session-start
	 * but lives under the widget prefix so the embed has a single cohesive surface:
	 *   POST /api/v1/widget/organizations/:organizationId/session
	 * Sets httpOnly visitor_session cookie (Visitor.externalId) and returns visitor row.
	 */
	@Post("organizations/:organizationId/session")
	@ApiOperation({ summary: "Start widget visitor session (public)" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({
		status: 201,
		description: "Session started and visitor returned",
	})
	@ApiResponse({ status: 404, description: "Organization not found" })
	sessionStart(
		@Param("organizationId") organizationId: string,
		@Body() dto: StartVisitorSessionDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const ip =
			(req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress;
		const existingSessionId = req.cookies?.[VISITOR_SESSION_COOKIE] as
			| string
			| undefined;

		return this.visitorService
			.startSession(organizationId, ip, existingSessionId, dto)
			.then(({ visitor, sessionId }) => {
				res.cookie(VISITOR_SESSION_COOKIE, sessionId, {
					httpOnly: true,
					sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
					secure: process.env.NODE_ENV === "production",
					path: "/",
					maxAge: VISITOR_SESSION_MAX_AGE_MS,
				});
				return {
					message: "Visitor session started successfully",
					data: visitor,
				};
			});
	}

	/**
	 * Public - lazy conversation creation for the widget.
	 * Mirrors POST /conversations but namespaced for the widget.
	 *   POST /api/v1/widget/conversations
	 */
	@Post("conversations")
	@ApiOperation({ summary: "Create conversation from widget (public)" })
	@ApiResponse({ status: 201, description: "Conversation created" })
	createConversation(@Body() dto: CreateConversationDto, @Req() req: Request) {
		const ip =
			(req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress;
		const userAgent = req.headers["user-agent"];
		return this.conversationService.create(dto, ip, userAgent);
	}

	/**
	 * Public - list messages for a widget conversation.
	 * Mirrors GET /conversations/:id/messages.
	 *   GET /api/v1/widget/conversations/:conversationId/messages
	 */
	@Get("conversations/:conversationId/messages")
	@ApiOperation({ summary: "List messages for widget conversation (public)" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Messages returned" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async findMessages(
		@Param("conversationId") conversationId: string,
		@Query() query: ListMessagesDto,
	) {
		await this.conversationService.assertWidgetConversation(conversationId);
		return this.messageService.findByConversation(conversationId, {
			limit: query.limit,
			cursor: query.cursor,
			direction: query.direction,
			excludeInternalNotes: true,
		});
	}

	/**
	 * Public - send message as visitor via widget.
	 * Mirrors POST /conversations/:id/messages/visitor and broadcasts to both
	 * WS rooms and SSE (org + conversation keys) so agent inbox updates live.
	 *   POST /api/v1/widget/conversations/:conversationId/messages
	 */
	@Post("conversations/:conversationId/messages")
	@ApiOperation({ summary: "Send message as visitor via widget (public)" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 201, description: "Message sent" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async sendVisitorMessage(
		@Param("conversationId") conversationId: string,
		@Body() dto: SendMessageDto,
	) {
		await this.conversationService.assertWidgetConversation(conversationId);
		const result = await this.messageService.create(
			conversationId,
			dto,
			"VISITOR",
		);
		await this.widgetEvents.messageCreated({
			conversationId,
			message: result.data,
		});
		return result;
	}
}
