import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginDto {
	@ApiProperty({
		description: "Platform admin email address",
		example: "admin@example.com",
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({ description: "Platform admin password" })
	@IsString()
	@IsNotEmpty()
	password!: string;
}
