import { IsEnum, IsOptional, IsString } from "class-validator";

export class UserOnboardingDto {
	@IsString()
	firstName!: string;

	@IsString()
	lastName!: string;

	@IsEnum(["light", "dark"])
	theme!: "light" | "dark";

	@IsString()
	@IsOptional()
	referralSource?: string;

	@IsString()
	@IsOptional()
	industry?: string;
}
