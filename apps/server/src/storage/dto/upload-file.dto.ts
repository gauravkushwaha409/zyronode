import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UploadFileDto {
	@ApiProperty({ description: "Organization ID (must match the conversation's org)" })
	@IsString()
	@IsNotEmpty()
	organizationId!: string;
}
