import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class ListInboxSessionsDto {
  @IsString()
  organizationId!: string;

  @IsEnum(["ACTIVE", "IDLE", "CLOSED", "PENDING"] as const)
  @IsOptional()
  status?: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING";

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
