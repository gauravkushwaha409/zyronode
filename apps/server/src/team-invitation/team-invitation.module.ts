import { Module } from "@nestjs/common";
import { TeamInvitationController } from "./team-invitation.controller";
import { TeamInvitationService } from "./team-invitation.service";

@Module({
	controllers: [TeamInvitationController],
	providers: [TeamInvitationService],
})
export class TeamInvitationModule {}
