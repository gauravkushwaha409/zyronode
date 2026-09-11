import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PermissionEntity } from "./permission.entity";

export class RoleEntity {
	@ApiProperty({ description: "Role ID" })
	id!: string;

	@ApiProperty({ description: "Role name", example: "Support Lead" })
	name!: string;

	@ApiPropertyOptional({ description: "Role description" })
	description?: string | null;

	@ApiProperty({ description: "True for platform-wide seeded roles (immutable)" })
	isSystem!: boolean;

	@ApiProperty({ description: "Owning organization; null for system roles" })
	organizationId!: string | null;

	@ApiProperty({ type: PermissionEntity, isArray: true })
	permissions!: PermissionEntity[];

	@ApiProperty({ description: "Number of members assigned this role" })
	membersCount!: number;
}