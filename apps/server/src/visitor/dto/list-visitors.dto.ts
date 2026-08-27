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

export const VISITOR_DEVICE_TYPES = ["desktop", "mobile", "tablet"] as const;

export class ListVisitorsDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	/** Opaque cursor - the id of the last visitor from the previous page. */
	@IsOptional()
	@IsString()
	cursor?: string;

	@IsOptional()
	@IsString()
	country?: string;

	@IsOptional()
	@IsIn(VISITOR_DEVICE_TYPES)
	deviceType?: (typeof VISITOR_DEVICE_TYPES)[number];

	@IsOptional()
	@Transform(({ value }) => {
		if (value === "true" || value === true) return true;
		if (value === "false" || value === false) return false;
		return undefined;
	})
	@IsBoolean()
	isOnline?: boolean;

	/** Free-text match against name, email and ip address. */
	@IsOptional()
	@IsString()
	search?: string;
}
