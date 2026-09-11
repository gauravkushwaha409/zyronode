import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";

const TEAM_INCLUDE = {
	leader: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			profile: true,
		},
	},
	members: {
		select: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					profile: true,
				},
			},
		},
	},
	_count: { select: { members: true } },
} as const;

const NOT_ORGANIZATION_MEMBER = "You are not a member of this organization";
const TEAM_NOT_FOUND = "Team not found";

@Injectable()
export class TeamService {
	constructor(private readonly prisma: PrismaService) {}

	async listTeams(organizationId: string, userId: string) {
		await this.assertMembership(organizationId, userId);

		const teams = await this.prisma.team.findMany({
			where: { organizationId },
			orderBy: { name: "asc" },
			include: TEAM_INCLUDE,
		});

		return teams.map(({ _count, members, ...team }) => ({
			...team,
			membersCount: _count.members,
			members: members.map((m) => m.user),
		}));
	}

	async createTeam(organizationId: string, userId: string, dto: CreateTeamDto) {
		await this.assertMembership(organizationId, userId);

		if (dto.leaderId) {
			await this.assertMemberIsInOrg(dto.leaderId, organizationId);
		}

		try {
			const team = await this.prisma.team.create({
				data: {
					name: dto.name,
					description: dto.description,
					organizationId,
					...(dto.leaderId && { leaderId: dto.leaderId }),
				},
				include: TEAM_INCLUDE,
			});
			return this.flatten(team);
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002"
			) {
				throw new ConflictException({
					message: `Team "${dto.name}" already exists in this organization`,
					error_code: "TEAM_NAME_TAKEN",
				});
			}
			throw e;
		}
	}

	async updateTeam(
		organizationId: string,
		userId: string,
		teamId: string,
		dto: UpdateTeamDto,
	) {
		await this.assertMembership(organizationId, userId);
		await this.findTeam(teamId, organizationId);

		if (dto.leaderId !== undefined && dto.leaderId !== null) {
			await this.assertMemberIsInOrg(dto.leaderId, organizationId);
		}

		try {
			const team = await this.prisma.team.update({
				where: { id: teamId },
				data: {
					name: dto.name,
					description: dto.description,
					...(dto.leaderId !== undefined && { leaderId: dto.leaderId ?? null }),
				},
				include: TEAM_INCLUDE,
			});
			return this.flatten(team);
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002"
			) {
				throw new ConflictException({
					message: `Team "${dto.name}" already exists in this organization`,
					error_code: "TEAM_NAME_TAKEN",
				});
			}
			throw e;
		}
	}

	async deleteTeam(organizationId: string, userId: string, teamId: string) {
		await this.assertMembership(organizationId, userId);
		await this.findTeam(teamId, organizationId);

		const membersCount = await this.prisma.organizationMember.count({
			where: { teamId },
		});
		if (membersCount > 0) {
			throw new ConflictException({
				message: "Team has members and cannot be deleted. Remove members first.",
				error_code: "TEAM_IN_USE",
			});
		}

		await this.prisma.team.delete({ where: { id: teamId } });
		return { id: teamId };
	}

	async addMembers(
		organizationId: string,
		userId: string,
		teamId: string,
		memberIds: string[],
	) {
		await this.assertMembership(organizationId, userId);
		await this.findTeam(teamId, organizationId);

		for (const memberId of memberIds) {
			await this.assertMemberIsInOrg(memberId, organizationId);
		}

		await this.prisma.organizationMember.updateMany({
			where: { userId: { in: memberIds }, organizationId },
			data: { teamId },
		});

		const team = await this.prisma.team.findUnique({
			where: { id: teamId },
			include: TEAM_INCLUDE,
		});
		return this.flatten(team!);
	}

	async removeMember(
		organizationId: string,
		userId: string,
		teamId: string,
		memberId: string,
	) {
		await this.assertMembership(organizationId, userId);
		await this.findTeam(teamId, organizationId);
		await this.assertMemberIsInOrg(memberId, organizationId);

		await this.prisma.organizationMember.updateMany({
			where: { userId: memberId, organizationId, teamId },
			data: { teamId: null },
		});

		const team = await this.prisma.team.findUnique({
			where: { id: teamId },
			include: TEAM_INCLUDE,
		});
		return this.flatten(team!);
	}

	private async findTeam(teamId: string, organizationId: string) {
		const team = await this.prisma.team.findUnique({
			where: { id: teamId },
			select: { id: true, organizationId: true },
		});
		if (!team || team.organizationId !== organizationId) {
			throw new NotFoundException({
				message: TEAM_NOT_FOUND,
				error_code: "TEAM_NOT_FOUND",
			});
		}
		return team;
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

	private async assertMemberIsInOrg(memberId: string, organizationId: string) {
		const membership = await this.prisma.organizationMember.findUnique({
			where: { userId_organizationId: { userId: memberId, organizationId } },
		});
		if (!membership) {
			throw new UnprocessableEntityException({
				message: "Leader must be a member of this organization",
				error_code: "LEADER_NOT_IN_ORG",
			});
		}
	}

	private flatten(team: {
		leader: {
			id: string;
			firstName: string | null;
			lastName: string | null;
			email: string;
			profile: string | null;
		} | null;
		members: {
			user: {
				id: string;
				firstName: string | null;
				lastName: string | null;
				email: string;
				profile: string | null;
			};
		}[];
		_count: { members: number };
	}) {
		return {
			...team,
			members: team.members.map((m) => m.user),
			membersCount: team._count.members,
		};
	}
}
