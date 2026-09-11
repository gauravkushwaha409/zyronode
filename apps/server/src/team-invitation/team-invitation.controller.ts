import {
	Body,
	Controller,
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
import { CreateTeamInvitationDto } from "./dto/create-team-invitation.dto";
import { TeamInvitationEntity } from "./entities/team-invitation.entity";
import { TeamInvitationService } from "./team-invitation.service";

@ApiTags("Team Invitations")
@Controller("organizations/:organizationId/team-invitations")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamInvitationController {
	constructor(private readonly teamInvitationService: TeamInvitationService) {}

	@Get()
	@ApiOperation({ summary: "List organization team invitations" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, type: TeamInvitationEntity, isArray: true })
	list(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.teamInvitationService.listInvitations(organizationId, userId);
	}

	@Post()
	@ApiOperation({ summary: "Invite a user to join the organization" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 201, type: TeamInvitationEntity })
	create(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateTeamInvitationDto,
	) {
		return this.teamInvitationService.createInvitation(
			organizationId,
			userId,
			dto,
		);
	}

	@Patch(":invitationId/revoke")
	@HttpCode(200)
	@ApiOperation({ summary: "Revoke a pending invitation" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiParam({ name: "invitationId", description: "Invitation ID" })
	@ApiResponse({ status: 200, description: "Invitation revoked" })
	revoke(
		@Param("organizationId") organizationId: string,
		@Param("invitationId") invitationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.teamInvitationService.revokeInvitation(
			organizationId,
			userId,
			invitationId,
		);
	}
}
