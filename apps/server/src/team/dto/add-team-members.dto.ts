import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class AddTeamMembersDto {
	@ApiProperty({
		description: "Organization member user IDs to add to the team",
		example: ["a1b2c3...", "d4e5f6..."],
	})
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID("4", { each: true })
	memberIds!: string[];
}
