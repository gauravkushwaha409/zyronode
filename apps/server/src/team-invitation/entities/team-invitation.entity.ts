import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TeamInvitationEntity {
	@ApiProperty({ description: "Invitation ID" })
	id!: string;

	@ApiProperty({ description: "Invitee email" })
	email!: string;

	@ApiProperty({
		description: "Invitation status",
		enum: ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"],
	})
	status!: string;

	@ApiPropertyOptional({ description: "Team assigned on acceptance" })
	team?: { id: string; name: string } | null;

	@ApiPropertyOptional({ description: "Role assigned on acceptance" })
	role?: { id: string; name: string } | null;

	@ApiProperty({ description: "Inviting user" })
	invitedBy?: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
	} | null;

	@ApiPropertyOptional({ description: "Invitation expiry" })
	expiresAt?: string | null;

	@ApiProperty({ description: "Creation timestamp" })
	createdAt!: string;
}
