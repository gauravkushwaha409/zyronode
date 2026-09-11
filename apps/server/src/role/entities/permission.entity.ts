import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PermissionEntity {
	@ApiProperty({ description: "Permission ID" })
	id!: string;

	@ApiProperty({
		description: "Stable unique key (module.resource.verb)",
		example: "team.roles.write",
	})
	key!: string;

	@ApiProperty({ description: "Human readable name", example: "Manage roles" })
	name!: string;

	@ApiPropertyOptional({ description: "Description" })
	description?: string | null;

	@ApiProperty({ description: "Grouping module", example: "team" })
	module!: string;
}