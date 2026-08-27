import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVisitorNoteDto {
	@ApiProperty({ description: 'Note content (max 5000 characters)', example: 'Follow up with this visitor next week', maxLength: 5000 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(5000)
	content!: string;
}
