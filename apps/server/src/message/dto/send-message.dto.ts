import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SendMessageDto {
  @ApiProperty({ description: 'Message content', example: 'Hello, how can I help you?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ description: 'Message type', enum: ['TEXT', 'FILE', 'INTERNAL_NOTE'], example: 'TEXT' })
  @IsEnum(["TEXT", "FILE", "INTERNAL_NOTE"] as const)
  @IsOptional()
  messageType?: "TEXT" | "FILE" | "INTERNAL_NOTE";

  @ApiPropertyOptional({ description: 'ID of the message being replied to' })
  @IsString()
  @IsOptional()
  replyToId?: string;
}
