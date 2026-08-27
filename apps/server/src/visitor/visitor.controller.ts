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
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { ListVisitorsDto } from "./dto/list-visitors.dto";
import { CreateVisitorNoteDto } from "./dto/update-visitor.dto";
import {
	AssignVisitorAgentDto,
	UpdateVisitorDetailsDto,
} from "./dto/update-visitor-details.dto";
import { VisitorService } from "./visitor.service";

@ApiTags("Visitor")
@Controller("organizations/:organizationId/visitors")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VisitorController {
	constructor(private readonly visitorService: VisitorService) {}

	@Get()
	@ApiOperation({ summary: 'List visitors for an organization' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiResponse({ status: 200, description: 'Visitors returned' })
	list(
		@Param("organizationId") organizationId: string,
		@Query() query: ListVisitorsDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.list(userId, organizationId, query);
	}

	@Get("analytics/stat-cards")
	@ApiOperation({ summary: 'Get visitor analytics stat cards' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiResponse({ status: 200, description: 'Stats returned' })
	statCards(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.statCards(userId, organizationId);
	}

	@Get("analytics/by-country")
	@ApiOperation({ summary: 'Get visitor analytics by country' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiResponse({ status: 200, description: 'Country analytics returned' })
	byCountry(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.byCountry(userId, organizationId);
	}

	@Get("analytics/top-pages")
	@ApiOperation({ summary: 'Get top visited pages' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiResponse({ status: 200, description: 'Top pages returned' })
	topPages(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.topPages(userId, organizationId);
	}

	@Get("filters/countries")
	@ApiOperation({ summary: 'Get available country filter options' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiResponse({ status: 200, description: 'Country options returned' })
	countryOptions(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.countryOptions(userId, organizationId);
	}

	@Get(":visitorId")
	@ApiOperation({ summary: 'Get visitor details' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiParam({ name: 'visitorId', description: 'Visitor ID' })
	@ApiResponse({ status: 200, description: 'Visitor details returned' })
	@ApiResponse({ status: 404, description: 'Visitor not found' })
	info(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.info(userId, organizationId, visitorId);
	}

	@Patch(":visitorId")
	@ApiOperation({ summary: 'Update visitor details' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiParam({ name: 'visitorId', description: 'Visitor ID' })
	@ApiResponse({ status: 200, description: 'Visitor updated' })
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
	@ApiOperation({ summary: 'Assign an agent to a visitor' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiParam({ name: 'visitorId', description: 'Visitor ID' })
	@ApiResponse({ status: 200, description: 'Agent assigned' })
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
	@ApiOperation({ summary: 'List visitor notes' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiParam({ name: 'visitorId', description: 'Visitor ID' })
	@ApiResponse({ status: 200, description: 'Notes returned' })
	listNotes(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.listNotes(userId, organizationId, visitorId);
	}

	@Post(":visitorId/notes")
	@ApiOperation({ summary: 'Create a visitor note' })
	@ApiParam({ name: 'organizationId', description: 'Organization ID' })
	@ApiParam({ name: 'visitorId', description: 'Visitor ID' })
	@ApiResponse({ status: 201, description: 'Note created' })
	createNote(
		@Param("organizationId") organizationId: string,
		@Param("visitorId") visitorId: string,
		@Body() dto: CreateVisitorNoteDto,
		@CurrentUser("id") userId: string,
	) {
		return this.visitorService.createNote(userId, organizationId, visitorId, dto);
	}
}
