import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

const CURRENT_ORG_COOKIE = "organization";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class OrganizationService {
	constructor(private prisma: PrismaService) {}

	async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
		const organization = await this.prisma.$transaction(async (tx) => {
			const { name, website, phone, industry, plan } = createOrganizationDto;
			const org = await tx.organization.create({
				data: {
					name,
					website,
					phone,
					industry,
					...(plan && { plan }),
				},
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

	/**
	 * Verifies the user is a member of the given organization and, if so,
	 * switches the "current organization" by persisting it server-side in an
	 * httpOnly cookie (and updating the user's lastOrgId marker).
	 */
	async switchOrganization(
		userId: string,
		organizationId: string,
		response: Response,
	) {
		const membership = await this.prisma.organizationMember.findUnique({
			where: { userId_organizationId: { userId, organizationId } },
		});

		if (!membership) {
			throw new ForbiddenException({
				message: "You are not a member of this organization",
				error_code: "NOT_ORGANIZATION_MEMBER",
			});
		}

		await this.prisma.user.update({
			where: { id: userId },
			data: { lastOrgId: organizationId },
		});

		response.cookie(CURRENT_ORG_COOKIE, organizationId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: COOKIE_MAX_AGE_MS,
		});

		const organization = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		return {
			message: "Organization switched successfully",
			success: true,
			statusCode: 200,
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
				role: {
					select: {
						id: true,
						name: true,
						isSystem: true,
					},
				},
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
