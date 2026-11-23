import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreatePlanDto {
	@ApiProperty({ example: "Pro" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ example: "pro" })
	@IsString()
	@IsNotEmpty()
	slug!: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({ description: "Monthly price in minor currency units", default: 0 })
	@IsInt()
	@Min(0)
	@IsOptional()
	monthlyPrice?: number;

	@ApiPropertyOptional({ description: "Annual price in minor currency units", default: 0 })
	@IsInt()
	@Min(0)
	@IsOptional()
	annualPrice?: number;

	@ApiPropertyOptional()
	@IsInt()
	@Min(0)
	@IsOptional()
	maxMembers?: number;

	@ApiPropertyOptional()
	@IsInt()
	@Min(0)
	@IsOptional()
	maxVisitors?: number;

	@ApiPropertyOptional({ default: true })
	@IsOptional()
	isActive?: boolean;
}
