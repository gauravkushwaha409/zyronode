import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class UpdateRoleDto {
	@ApiPropertyOptional({ description: "Role name", example: "Support Lead" })
	@IsString()
	@IsOptional()
	@MaxLength(50)
	name?: string;

	@ApiPropertyOptional({
		description: "Role description",
		example: "Leads the support team",
	})
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
	@IsNotEmpty()
	@IsUUID("4", { each: true })
	permissionIds?: string[];
}
