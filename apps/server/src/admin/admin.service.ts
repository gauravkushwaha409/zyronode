import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ListAdminQueryDto } from "./dto/list-admin-query.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function pagination(page?: number, limit?: number) {
	const currentPage = Math.max(page ?? DEFAULT_PAGE, 1);
	const pageSize = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), 100);
	return {
		page: currentPage,
		limit: pageSize,
		skip: (currentPage - 1) * pageSize,
	};
}

@Injectable()
export class AdminService {
	constructor(private prisma: PrismaService) {}

	async listOrganizations(query: ListAdminQueryDto) {
		const { page, limit, skip } = pagination(query.page, query.limit);
		const search = query.search?.trim();

		const where = search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ website: { contains: search, mode: "insensitive" as const } },
						{ industry: { contains: search, mode: "insensitive" as const } },
					],
				}
			: {};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.organization.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
				select: {
					id: true,
					name: true,
					website: true,
					phone: true,
					industry: true,
					plan: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							members: true,
							visitors: true,
							conversations: true,
							teams: true,
						},
					},
				},
			}),
			this.prisma.organization.count({ where }),
		]);

		return {
			message: "Organizations fetched successfully",
			data: {
				items,
				meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
			},
		};
	}

	async listUsers(query: ListAdminQueryDto) {
		const { page, limit, skip } = pagination(query.page, query.limit);
		const search = query.search?.trim();

		const where = search
			? {
					OR: [
						{ email: { contains: search, mode: "insensitive" as const } },
						{ firstName: { contains: search, mode: "insensitive" as const } },
						{ lastName: { contains: search, mode: "insensitive" as const } },
					],
				}
			: {};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.user.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					profile: true,
					platformRole: true,
					isEmailVerified: true,
					isOnboarded: true,
					createdAt: true,
					updatedAt: true,
					lastOrg: { select: { id: true, name: true } },
					_count: { select: { organizations: true } },
				},
			}),
			this.prisma.user.count({ where }),
		]);

		return {
			message: "Users fetched successfully",
			data: {
				items,
				meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
			},
		};
	}
}
