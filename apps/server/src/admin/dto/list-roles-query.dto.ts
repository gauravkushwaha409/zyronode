import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class ListRolesQueryDto {
	@ApiPropertyOptional({ enum: ["PLATFORM", "ORGANIZATION"] })
	@IsIn(["PLATFORM", "ORGANIZATION"])
	@IsOptional()
	scope?: "PLATFORM" | "ORGANIZATION";

	@ApiPropertyOptional({
		description: "Search term for role name or description",
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Filter by role type",
		enum: ["all", "system", "custom"],
	})
	@IsIn(["all", "system", "custom"])
	@IsOptional()
	type?: "all" | "system" | "custom";
}
