import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export const VISITOR_DEVICE_TYPES = ["desktop", "mobile", "tablet"] as const;

export class ListVisitorsDto {
	@ApiPropertyOptional({ description: 'Items per page (1-100)', example: 20, default: 20, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@ApiPropertyOptional({ description: 'Opaque cursor - the id of the last visitor from the previous page' })
	@IsOptional()
	@IsString()
	cursor?: string;

	@ApiPropertyOptional({ description: 'Filter by country', example: 'US' })
	@IsOptional()
	@IsString()
	country?: string;

	@ApiPropertyOptional({ description: 'Filter by device type', enum: VISITOR_DEVICE_TYPES })
	@IsOptional()
	@IsIn(VISITOR_DEVICE_TYPES)
	deviceType?: (typeof VISITOR_DEVICE_TYPES)[number];

	@ApiPropertyOptional({ description: 'Filter by online status' })
	@IsOptional()
	@Transform(({ value }) => {
		if (value === "true" || value === true) return true;
		if (value === "false" || value === false) return false;
		return undefined;
	})
	@IsBoolean()
	isOnline?: boolean;

	@ApiPropertyOptional({ description: 'Free-text match against name, email and ip address' })
	@IsOptional()
	@IsString()
	search?: string;
}
