import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class RegisterPushTokenDto {
	@ApiProperty({ description: "FCM registration token for this browser" })
	@IsString()
	@IsNotEmpty()
	token!: string;

	@ApiPropertyOptional({ description: "Browser user agent (diagnostics only)" })
	@IsOptional()
	@IsString()
	@MaxLength(512)
	userAgent?: string;
}

export class RegisterWidgetPushTokenDto extends RegisterPushTokenDto {
	@ApiProperty({ description: "Organization whose site the visitor is on" })
	@IsString()
	@IsNotEmpty()
	organizationId!: string;
}
