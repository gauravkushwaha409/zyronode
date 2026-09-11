import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserSummaryEntity {
	@ApiProperty({ description: "User ID" })
	id!: string;

	@ApiProperty({ description: "First name" })
	firstName!: string | null;

	@ApiProperty({ description: "Last name" })
	lastName!: string | null;

	@ApiProperty({ description: "Email address" })
	email!: string;

	@ApiProperty({ description: "Profile avatar URL" })
	profile!: string | null;
}

export class TeamEntity {
	@ApiProperty({ description: "Team ID" })
	id!: string;

	@ApiProperty({ description: "Owning organization ID" })
	organizationId!: string;

	@ApiProperty({ description: "Team name", example: "Support" })
	name!: string;

	@ApiPropertyOptional({ description: "Team description" })
	description?: string | null;

	@ApiProperty({
		description: "Team leader",
		type: UserSummaryEntity,
		nullable: true,
	})
	leader!: UserSummaryEntity | null;

	@ApiProperty({
		description: "Team members",
		type: UserSummaryEntity,
		isArray: true,
	})
	members!: UserSummaryEntity[];

	@ApiProperty({ description: "Number of members in the team" })
	membersCount!: number;
}
