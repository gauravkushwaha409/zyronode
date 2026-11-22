import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
export class UpdatePlatformRoleDto {
	@ApiPropertyOptional({
		description: "Platform role ID to assign; null removes platform access",
		example: "9e0a6e77-0c7f-4b4d-8a43-9c2d7a4b1f30",
	})
	@IsOptional()
	@IsUUID()
	roleId!: string | null;
}
