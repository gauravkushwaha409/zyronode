import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateConversationDto {
  @ApiProperty({ description: 'Organization ID', example: 'f95d4ede-71a0-46c9-a3d2-d1f56609cd01' })
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiPropertyOptional({ description: 'Visitor ID to link this conversation to' })
  @IsString()
  @IsOptional()
  visitorId?: string;

  @ApiPropertyOptional({ description: 'Source URL where the conversation started' })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Visitor display name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  visitorName?: string;

  @ApiPropertyOptional({ description: 'Visitor email address', example: 'visitor@example.com' })
  @IsString()
  @IsOptional()
  visitorEmail?: string;

  @ApiPropertyOptional({ description: 'Visitor phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  visitorPhone?: string;

  @ApiPropertyOptional({ description: 'Conversation channel', example: 'web' })
  @IsOptional()
  channel?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
