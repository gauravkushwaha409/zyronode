import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { ListVisitorsDto } from "./dto/list-visitors.dto";
import { StartVisitorSessionDto } from "./dto/start-visitor-session.dto";
import { CreateVisitorNoteDto } from "./dto/update-visitor.dto";
import {
	AssignVisitorAgentDto,
	UpdateVisitorDetailsDto,
} from "./dto/update-visitor-details.dto";
import { VisitorService } from "./visitor.service";

/** httpOnly cookie that pins a browser to one visitor per organization. */
export const VISITOR_SESSION_COOKIE = "visitor_session";
const VISITOR_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@ApiTags("Visitor")
@Controller("organizations/:organizationId/visitors")
export class VisitorController {
	constructor(private readonly visitorService: VisitorService) {}

	/**
	 * Public - called by the widget from an unauthenticated browser. Starts a
	 * visitor session: sets the httpOnly visitor_session cookie (the stable
	 * browser id stored as Visitor.externalId) and returns the visitor row.
	 * A browser keeps its visitor until the cookie is manually cleared.
	 */
	@Post("session-start")
	@ApiOperation({ summary: "Start a visitor session (public)" })
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
					// cross-site widget embeds need None+Secure; dev is same-site
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

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "List visitors for an organization" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Visitors returned" })
	list(
		@Param("organizationId") organizationId: string,
		@Query() query: ListVisitorsDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.list(userId, organizationId, query);
	}

	@Get("analytics/stat-cards")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get visitor analytics stat cards" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Stats returned" })
	statCards(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.statCards(userId, organizationId);
	}

	@Get("analytics/by-country")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get visitor analytics by country" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Country analytics returned" })
	byCountry(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.byCountry(userId, organizationId);
	}

	@Get("analytics/top-pages")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get top visited pages" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Top pages returned" })
	topPages(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.topPages(userId, organizationId);
	}

	@Get("filters/countries")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get available country filter options" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Country options returned" })
	countryOptions(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.countryOptions(userId, organizationId);
	}

	@Get(":visitorId")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get visitor details" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "visitorId", description: "Visitor ID" })
	@ApiResponse({ status: 200, description: "Visitor details returned" })
	@ApiResponse({ status: 404, description: "Visitor not found" })
	info(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.info(userId, organizationId, visitorId);
	}

	@Patch(":visitorId")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Update visitor details" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "visitorId", description: "Visitor ID" })
	@ApiResponse({ status: 200, description: "Visitor updated" })
	updateDetails(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@Body() dto: UpdateVisitorDetailsDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.updateDetails(
			userId,
			organizationId,
			visitorId,
			dto,
		);
	}

	@Patch(":visitorId/assignee")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Assign an agent to a visitor" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "visitorId", description: "Visitor ID" })
	@ApiResponse({ status: 200, description: "Agent assigned" })
	assignAgent(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@Body() dto: AssignVisitorAgentDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.assignAgent(
			userId,
			organizationId,
			visitorId,
			dto,
		);
	}

	@Get(":visitorId/notes")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "List visitor notes" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "visitorId", description: "Visitor ID" })
	@ApiResponse({ status: 200, description: "Notes returned" })
	listNotes(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.listNotes(userId, organizationId, visitorId);
	}

	@Post(":visitorId/notes")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Create a visitor note" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "visitorId", description: "Visitor ID" })
	@ApiResponse({ status: 201, description: "Note created" })
	createNote(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@Body() dto: CreateVisitorNoteDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.createNote(userId, organizationId, visitorId, dto);
	}
}
