import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Injectable()
export class OrganizationService {
	constructor(private prisma: PrismaService) {}

	async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
		const organization = await this.prisma.$transaction(async (tx) => {
			const { name } = createOrganizationDto;
		const org = await tx.organization.create({
			data: { name },
		});

			await tx.organizationMember.create({
				data: {
					userId,
					organizationId: org.id,
				},
			});

			await tx.user.update({
				where: { id: userId },
				data: { lastOrgId: org.id },
			});

			return org;
		});

		return {
			message: "Organization created successfully",
			success: true,
			statusCode: 201,
			data: organization,
		};
	}

	findAll() {
		return `This action returns all organization`;
	}

	findOne(id: number) {
		return `This action returns a #${id} organization`;
	}

	update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
		return `This action updates a #${id} organization`;
	}

	remove(id: number) {
		return `This action removes a #${id} organization`;
	}

	async getMyOrganizations(userId: string) {
		const organizations = await this.prisma.organization.findMany({
			where: {
				members: {
					some: {
						userId,
					},
				},
			},
			include: {
				members: {
					where: { userId },
					select: {
						joinedAt: true,
						user: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
			},
		});

		if (!organizations.length) {
			throw new NotFoundException("No organizations found");
		}

		return {
			message: "Organizations fetched successfully",
			success: true,
			statusCode: 200,
			data: organizations,
		};
	}

	/**
	 * Members of one organization. The caller must be a member themselves,
	 * so this cannot be used to enumerate another tenant's users.
	 */
	async getMembers(organizationId: string, userId: string) {
		const callerMembership = await this.prisma.organizationMember.findUnique({
			where: { userId_organizationId: { userId, organizationId } },
		});
		if (!callerMembership) {
			throw new ForbiddenException({
				message: "You are not a member of this organization",
				error_code: "NOT_ORGANIZATION_MEMBER",
			});
		}

		const members = await this.prisma.organizationMember.findMany({
			where: { organizationId },
			orderBy: { joinedAt: "asc" },
			select: {
				joinedAt: true,
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
		});

		return {
			message: "Organization members fetched successfully",
			data: members,
		};
	}
}
