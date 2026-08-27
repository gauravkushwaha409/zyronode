import {
	IsEmail,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export const VISITOR_STATUSES = [
	"NEW",
	"REVIEWED",
	"CONVERTED",
	"IGNORED",
] as const;

/**
 * Agent-editable visitor fields. Presence/geo/device columns are written by
 * the widget, never by this endpoint.
 */
export class UpdateVisitorDetailsDto {
	@IsOptional()
	@IsString()
	@MaxLength(255)
	name?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	phone?: string;

	@IsOptional()
	@IsIn(VISITOR_STATUSES)
	status?: (typeof VISITOR_STATUSES)[number];
}

export class AssignVisitorAgentDto {
	/** null clears the assignment. */
	@IsOptional()
	@IsString()
	agentId?: string | null;
}
