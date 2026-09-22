import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListInternalNotesDto {
	@ApiPropertyOptional({ description: "Items per page (1-100)", example: 20, default: 20, minimum: 1, maximum: 100 })
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	limit?: number;

	@ApiPropertyOptional({ description: "Opaque cursor for keyset pagination (base64 JSON {createdAt,id})" })
	@IsString()
	@IsOptional()
	cursor?: string;

	@ApiPropertyOptional({ description: "Pagination direction", enum: ["next", "prev"], default: "next" })
	@IsEnum(["next", "prev"] as const)
	@IsOptional()
	direction?: "next" | "prev";
}
