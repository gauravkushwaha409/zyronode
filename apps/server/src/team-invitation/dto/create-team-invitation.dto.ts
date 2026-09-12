import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsUUID, MaxLength } from "class-validator";

export class CreateTeamInvitationDto {
	@ApiProperty({ description: "Invitee email", example: "newagent@chatboq.com" })
	@IsEmail()
	@MaxLength(320)
	email!: string;

	@ApiPropertyOptional({
		description: "Role assigned on acceptance (ID of a system or custom role)",
		example: "a1b2c3...",
	})
	@IsUUID("4")
	@IsOptional()
	roleId?: string;

	@ApiPropertyOptional({
		description: "Team assigned on acceptance",
		example: "d4e5f6...",
	})
	@IsUUID("4")
	@IsOptional()
	teamId?: string;
}
