import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { TeamEntity } from "./entities/team.entity";
import { TeamService } from "./team.service";

@ApiTags("Teams")
@Controller("organizations/:organizationId/teams")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamController {
	constructor(private readonly teamService: TeamService) {}

	@Get()
	@ApiOperation({ summary: "List organization teams" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, type: TeamEntity, isArray: true })
	list(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.teamService.listTeams(organizationId, userId);
	}

	@Post()
	@ApiOperation({ summary: "Create a team" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 201, type: TeamEntity })
	create(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateTeamDto,
	) {
		return this.teamService.createTeam(organizationId, userId, dto);
	}

	@Patch(":teamId")
	@ApiOperation({ summary: "Update a team (name, description, leader)" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "teamId", description: "Team ID" })
	@ApiResponse({ status: 200, type: TeamEntity })
	update(
		@Param("organizationId") organizationId: string,
		@Param("teamId") teamId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: UpdateTeamDto,
	) {
		return this.teamService.updateTeam(organizationId, userId, teamId, dto);
	}

	@Delete(":teamId")
	@HttpCode(200)
	@ApiOperation({ summary: "Delete a team" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "teamId", description: "Team ID" })
	@ApiResponse({ status: 200, description: "Team deleted" })
	remove(
		@Param("organizationId") organizationId: string,
		@Param("teamId") teamId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.teamService.deleteTeam(organizationId, userId, teamId);
	}
}
