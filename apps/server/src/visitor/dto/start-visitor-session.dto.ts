import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Public session-start payload. The visitor's identity is carried by the
 * httpOnly `visitor_session` cookie, not this body — sourceUrl is just the
 * landing page for presence context.
 */
export class StartVisitorSessionDto {
	@ApiPropertyOptional({
		description: "Page the visitor landed on",
		example: "https://acme.com/pricing",
		maxLength: 2048,
	})
	@IsOptional()
	@IsString()
	@MaxLength(2048)
	sourceUrl?: string;
}
