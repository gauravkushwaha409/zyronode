import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { ListVisitorsDto } from "./dto/list-visitors.dto";
import { CreateVisitorNoteDto } from "./dto/update-visitor.dto";
import {
	AssignVisitorAgentDto,
	UpdateVisitorDetailsDto,
} from "./dto/update-visitor-details.dto";
import { VisitorService } from "./visitor.service";

/**
 * organizationId is always taken from the path and re-checked against the
 * caller's memberships in the service - never trusted from a body.
 */
@Controller("organizations/:organizationId/visitors")
@UseGuards(JwtAuthGuard)
export class VisitorController {
	constructor(private readonly visitorService: VisitorService) {}

	@Get()
	list(
		@Param("organizationId") organizationId: string,
		@Query() query: ListVisitorsDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.list(userId, organizationId, query);
	}

	@Get("analytics/stat-cards")
	statCards(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.statCards(userId, organizationId);
	}

	@Get("analytics/by-country")
	byCountry(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.byCountry(userId, organizationId);
	}

	@Get("analytics/top-pages")
	topPages(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.topPages(userId, organizationId);
	}

	@Get("filters/countries")
	countryOptions(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.countryOptions(userId, organizationId);
	}

	// declared after the static segments above so "analytics"/"filters"
	// are never swallowed by :visitorId
	@Get(":visitorId")
	info(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.info(userId, organizationId, visitorId);
	}

	@Patch(":visitorId")
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
	listNotes(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.listNotes(userId, organizationId, visitorId);
	}

	@Post(":visitorId/notes")
	createNote(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@Body() dto: CreateVisitorNoteDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.createNote(userId, organizationId, visitorId, dto);
	}
}
