import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class CreateTeamDto {
	@ApiProperty({ description: "Team name", example: "Support" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name!: string;

	@ApiPropertyOptional({
		description: "Team description",
		example: "Handles customer support inquiries",
	})
	@IsString()
	@IsOptional()
	@MaxLength(300)
	description?: string;

	@ApiPropertyOptional({
		description: "User ID of the team leader (must be an organization member)",
		example: "a1b2c3...",
	})
	@IsUUID("4")
	@IsOptional()
	leaderId?: string;
}
