import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailDto {
	@ApiProperty({ description: '6-digit email verification code', example: '123456', minLength: 6, maxLength: 6 })
	@IsString()
	@Length(6, 6)
	code!: string;
}
