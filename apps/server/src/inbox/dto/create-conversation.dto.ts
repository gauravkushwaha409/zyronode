import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum CreatedBy {
	AGENT = "agent",
	VISITOR = "visitor",
}

export class CreateConversationDto {
	@ApiProperty({
		description: "Organization ID",
		example: "f95d4ede-71a0-46c9-a3d2-d1f56609cd01",
	})
	@IsString()
	@IsNotEmpty({ always: true })
	organizationId!: string;

	@ApiPropertyOptional({
		description: "Visitor ID to link this conversation to",
	})
	@IsString()
	@IsNotEmpty({ always: true })
	visitorId!: string;

	@ApiPropertyOptional({ description: "Conversation channel", example: "web" })
	@IsNotEmpty({ always: true })
	channel!: string;

	@ApiPropertyOptional({
		description: "Who created the conversation",
		enum: CreatedBy,
		default: CreatedBy.VISITOR,
	})
	@IsOptional()
	@IsEnum(CreatedBy)
	createdBy: CreatedBy = CreatedBy.VISITOR;
}
