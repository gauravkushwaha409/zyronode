import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateVisitorNoteDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(5000)
	content!: string;
}
