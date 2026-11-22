import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { AI_ACTIONS, type AiAction } from "../ai.types";

export class RewriteDto {
	@ApiProperty({
		description: "The agent's current draft",
		example: "hey i will check and let you know",
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(8000)
	text!: string;

	@ApiProperty({
		description: "How to rewrite the draft",
		enum: [...AI_ACTIONS],
		example: "friendly",
	})
	@IsEnum([...AI_ACTIONS])
	action!: AiAction;
}
