import {
	IsEmail,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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
	@ApiPropertyOptional({ description: 'Visitor display name', example: 'John Doe', maxLength: 255 })
	@IsOptional()
	@IsString()
	@MaxLength(255)
	name?: string;

	@ApiPropertyOptional({ description: 'Visitor email address', example: 'visitor@example.com' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ description: 'Visitor phone number', example: '+1234567890', maxLength: 50 })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	phone?: string;

	@ApiPropertyOptional({ description: 'Visitor status', enum: VISITOR_STATUSES })
	@IsOptional()
	@IsIn(VISITOR_STATUSES)
	status?: (typeof VISITOR_STATUSES)[number];
}

export class AssignVisitorAgentDto {
	@ApiPropertyOptional({ description: 'Agent ID to assign. Null clears the assignment.', example: 'agent-uuid' })
	@IsOptional()
	@IsString()
	agentId?: string | null;
}
