import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SwitchOrganizationDto {
	@ApiProperty({
		description: "Organization ID to switch to",
		example: "f95d4ede-71a0-46c9-a3d2-d1f56609cd01",
	})
	@IsString()
	@IsNotEmpty()
	organizationId!: string;
}
