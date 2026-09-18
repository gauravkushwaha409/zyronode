import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateInternalNoteDto {
	@ApiProperty({
		description: "Note content",
		example: "Visitor mentioned they're on the Pro plan",
	})
	@IsString()
	@IsNotEmpty()
	content!: string;

	@ApiPropertyOptional({
		description: "ID of the note/message being replied to",
	})
	@IsString()
	@IsOptional()
	replyToId?: string;
}
