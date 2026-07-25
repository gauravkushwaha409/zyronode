import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  visitorName?: string;

  @IsString()
  @IsOptional()
  visitorEmail?: string;

  @IsString()
  @IsOptional()
  visitorPhone?: string;

  @IsString()
  @IsOptional()
  channel?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
