import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListInboxConversationsDto {
	@ApiProperty({
		description: "Organization ID",
		example: "f95d4ede-71a0-46c9-a3d2-d1f56609cd01",
	})
	@IsString()
	organizationId!: string;

	@ApiPropertyOptional({
		description: "Filter by conversation status",
		enum: ["ACTIVE", "IDLE", "CLOSED", "PENDING"],
	})
	@IsEnum(["ACTIVE", "IDLE", "CLOSED", "PENDING"] as const)
	@IsOptional()
	status?: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING";

	@ApiPropertyOptional({
		description: "Search term for conversation content or visitor info",
	})
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Items per page (1-100)",
		example: 20,
		default: 20,
		minimum: 1,
		maximum: 100,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	limit?: number;

	@ApiPropertyOptional({
		description:
			"Opaque cursor for keyset pagination (base64 JSON {updatedAt,id})",
		example:
			"eyJ1cGRhdGVkQXQiOiIyMDI2LTA5LTAyVDAwOjAwOjAwLjAwMFoiLCJpZCI6InV1aWQifQ==",
	})
	@IsString()
	@IsOptional()
	cursor?: string;

	@ApiPropertyOptional({
		description: "Pagination direction",
		enum: ["next", "prev"],
		default: "next",
	})
	@IsEnum(["next", "prev"] as const)
	@IsOptional()
	direction?: "next" | "prev";
}
