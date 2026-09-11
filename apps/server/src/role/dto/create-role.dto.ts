import {
	ArrayNotEmpty,
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRoleDto {
	@ApiProperty({ description: "Role name", example: "Support Lead" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name!: string;

	@ApiPropertyOptional({ description: "Role description", example: "Leads the support team" })
	@IsString()
	@IsOptional()
	@MaxLength(300)
	description?: string;

	@ApiProperty({
		description: "Permission IDs assigned to the role",
		example: ["3f3a...", "9b2c..."],
	})
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID("4", { each: true })
	permissionIds!: string[];
}