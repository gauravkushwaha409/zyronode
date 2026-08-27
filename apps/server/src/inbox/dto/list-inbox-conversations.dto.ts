import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ListInboxConversationsDto {
  @ApiProperty({ description: 'Organization ID', example: 'f95d4ede-71a0-46c9-a3d2-d1f56609cd01' })
  @IsString()
  organizationId!: string;

  @ApiPropertyOptional({ description: 'Filter by conversation status', enum: ['ACTIVE', 'IDLE', 'CLOSED', 'PENDING'] })
  @IsEnum(["ACTIVE", "IDLE", "CLOSED", "PENDING"] as const)
  @IsOptional()
  status?: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING";

  @ApiPropertyOptional({ description: 'Search term for conversation content or visitor info' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page (1-100)', example: 20, default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
