import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SuggestReplyDto {
	@ApiProperty({ description: "Organization that owns the conversation" })
	@IsString()
	@IsNotEmpty()
	organizationId!: string;
}
