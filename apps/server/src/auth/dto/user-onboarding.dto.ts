import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserOnboardingDto {
	@ApiProperty({ description: 'User first name', example: 'John' })
	@IsString()
	firstName!: string;

	@ApiProperty({ description: 'User last name', example: 'Doe' })
	@IsString()
	lastName!: string;

	@ApiProperty({ description: 'UI theme preference', enum: ['light', 'dark'], example: 'dark' })
	@IsEnum(["light", "dark"])
	theme!: "light" | "dark";

	@ApiPropertyOptional({ description: 'How the user found us', example: 'Google search' })
	@IsString()
	@IsOptional()
	referralSource?: string;

	@ApiPropertyOptional({ description: 'User industry', example: 'Technology' })
	@IsString()
	@IsOptional()
	industry?: string;
}
