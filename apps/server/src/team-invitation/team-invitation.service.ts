import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTeamInvitationDto } from "./dto/create-team-invitation.dto";

const INVITATION_INCLUDE = {
	team: { select: { id: true, name: true } },
	role: { select: { id: true, name: true } },
	invitedBy: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
		},
	},
} as const;

const NOT_ORGANIZATION_MEMBER = "You are not a member of this organization";
const INVITATION_NOT_FOUND = "Invitation not found";

@Injectable()
export class TeamInvitationService {
	constructor(private readonly prisma: PrismaService) {}

	async listInvitations(organizationId: string, userId: string) {
		await this.assertMembership(organizationId, userId);

		const invitations = await this.prisma.teamInvitation.findMany({
			where: { organizationId },
			orderBy: { createdAt: "desc" },
			include: INVITATION_INCLUDE,
		});

		return invitations.map(({ token: _token, ...invitation }) => invitation);
	}

	async createInvitation(
		organizationId: string,
		userId: string,
		dto: CreateTeamInvitationDto,
	) {
		await this.assertMembership(organizationId, userId);

		const email = dto.email.toLowerCase();

		if (dto.roleId) {
			const role = await this.prisma.role.findUnique({
				where: { id: dto.roleId },
				select: { id: true, organizationId: true },
			});
			if (
				!role ||
				(role.organizationId !== null && role.organizationId !== organizationId)
			) {
				throw new BadRequestException({
					message: "Role is not available in this organization",
					error_code: "INVALID_ROLE",
				});
			}
		}

		if (dto.teamId) {
			const team = await this.prisma.team.findUnique({
				where: { id: dto.teamId },
				select: { id: true, organizationId: true },
			});
			if (!team || team.organizationId !== organizationId) {
				throw new BadRequestException({
					message: "Team is not available in this organization",
					error_code: "INVALID_TEAM",
				});
			}
		}

		const existingMember = await this.prisma.organizationMember.findFirst({
			where: { organizationId, user: { email } },
		});
		if (existingMember) {
			throw new ConflictException({
				message: "This email is already a member of the organization",
				error_code: "ALREADY_MEMBER",
			});
		}

		const existingPending = await this.prisma.teamInvitation.findFirst({
			where: { organizationId, email, status: "PENDING" },
		});
		if (existingPending) {
			throw new ConflictException({
				message: "An invitation for this email is already pending",
				error_code: "INVITATION_ALREADY_PENDING",
			});
		}

		const invitation = await this.prisma.teamInvitation.create({
			data: {
				organizationId,
				email,
				invitedById: userId,
				roleId: dto.roleId,
				teamId: dto.teamId,
			},
			include: INVITATION_INCLUDE,
		});

		return this.sanitize(invitation);
	}

	async revokeInvitation(
		organizationId: string,
		userId: string,
		invitationId: string,
	) {
		await this.assertMembership(organizationId, userId);

		const existing = await this.prisma.teamInvitation.findUnique({
			where: { id: invitationId },
			select: { id: true, organizationId: true, status: true },
		});
		if (!existing || existing.organizationId !== organizationId) {
			throw new NotFoundException({
				message: INVITATION_NOT_FOUND,
				error_code: "INVITATION_NOT_FOUND",
			});
		}
		if (existing.status !== "PENDING") {
			throw new ConflictException({
				message: "Only pending invitations can be revoked",
				error_code: "INVITATION_NOT_PENDING",
			});
		}

		await this.prisma.teamInvitation.update({
			where: { id: invitationId },
			data: { status: "REVOKED" },
		});
		return { id: invitationId };
	}

	private async assertMembership(organizationId: string, userId: string) {
		const membership = await this.prisma.organizationMember.findUnique({
			where: { userId_organizationId: { userId, organizationId } },
		});
		if (!membership) {
			throw new ForbiddenException({
				message: NOT_ORGANIZATION_MEMBER,
				error_code: "NOT_ORGANIZATION_MEMBER",
			});
		}
	}

	private sanitize<T extends { token: string }>(invitation: T) {
		const { token: _token, ...rest } = invitation;
		return rest;
	}
}
