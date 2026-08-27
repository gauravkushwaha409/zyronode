import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendOtpDto {
	@ApiProperty({ description: 'Email address to send OTP to', example: 'john@example.com' })
	@IsEmail()
	email!: string;
}
