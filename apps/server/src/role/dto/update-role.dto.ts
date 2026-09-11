import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateRoleDto {
	@ApiPropertyOptional({ description: "Role name", example: "Support Lead" })
	@IsString()
	@IsOptional()
	@MaxLength(50)
	name?: string;

	@ApiPropertyOptional({ description: "Role description", example: "Leads the support team" })
	@IsString()
	@IsOptional()
	@MaxLength(300)
	description?: string;

	@ApiPropertyOptional({
		description: "Full replacement set of permission IDs",
		example: ["3f3a...", "9b2c..."],
	})
	@IsArray()
	@IsOptional()
	@IsUUID("4", { each: true })
	permissionIds?: string[];
}