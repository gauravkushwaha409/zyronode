import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateTeamDto {
	@ApiPropertyOptional({ description: "Team name", example: "Support" })
	@IsString()
	@IsOptional()
	@MaxLength(50)
	name?: string;

	@ApiPropertyOptional({
		description: "Team description",
		example: "Handles customer support inquiries",
	})
	@IsString()
	@IsOptional()
	@MaxLength(300)
	description?: string;

	@ApiPropertyOptional({
		description:
			"User ID of the team leader; omit to leave unchanged, send null to clear",
		example: "a1b2c3...",
	})
	@IsUUID("4")
	@IsOptional()
	leaderId?: string | null;
}
