import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "../role/dto/create-role.dto";
import { UpdateRoleDto } from "../role/dto/update-role.dto";
import { ListAdminQueryDto } from "./dto/list-admin-query.dto";
import { ListRolesQueryDto } from "./dto/list-roles-query.dto";

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
					platformRole: { select: { id: true, name: true, isSystem: true, scope: true } },
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

	async listRoles(query?: ListRolesQueryDto) {
		const search = query?.search?.trim();
		const where: Record<string, unknown> = {};

		if (query?.type === "system") {
			where.isSystem = true;
		} else if (query?.type === "custom") {
			where.isSystem = false;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" as const } },
				{ description: { contains: search, mode: "insensitive" as const } },
			];
		}

		const roles = await this.prisma.role.findMany({
			where,
			orderBy: [{ isSystem: "desc" }, { name: "asc" }],
			include: {
				organization: {
					select: { id: true, name: true },
				},
				permissions: {
					select: {
						permission: {
							select: {
								id: true,
								key: true,
								name: true,
								description: true,
								module: true,
							},
						},
					},
				},
				_count: {
					select: { members: true },
				},
			},
		});

		const items = roles.map(({ permissions, _count, ...role }) => ({
			...role,
			permissions: permissions.map((p) => p.permission),
			membersCount: _count.members,
		}));

		return {
			message: "Roles fetched successfully",
			data: { items },
		};
	}

	async listPermissions() {
		const permissions = await this.prisma.permission.findMany({
			orderBy: [{ module: "asc" }, { key: "asc" }],
			include: {
				roles: {
					select: {
						role: {
							select: {
								id: true,
								name: true,
								isSystem: true,
							},
						},
					},
				},
			},
		});

		const items = permissions.map(({ roles, ...permission }) => ({
			...permission,
			roles: roles.map((r) => r.role),
		}));

		return {
			message: "Permissions fetched successfully",
			data: { items },
		};
	}

	async createRole(dto: CreateRoleDto) {
		if (dto.permissionIds?.length) {
			const count = await this.prisma.permission.count({
				where: { id: { in: dto.permissionIds } },
			});
			if (count !== dto.permissionIds.length) {
				throw new BadRequestException("One or more permissions do not exist");
			}
		}

		const role = await this.prisma.role.create({
			data: {
				name: dto.name,
				description: dto.description,
				isSystem: false,
				scope: "PLATFORM",
				permissions: {
					createMany: {
						data: dto.permissionIds.map((permissionId) => ({ permissionId })),
					},
				},
			},
			include: {
				organization: { select: { id: true, name: true } },
				permissions: {
					select: {
						permission: {
							select: {
								id: true,
								key: true,
								name: true,
								description: true,
								module: true,
							},
						},
					},
				},
				_count: { select: { members: true } },
			},
		});

		return {
			message: "Role created successfully",
			data: {
				...role,
				permissions: role.permissions.map((p) => p.permission),
				membersCount: role._count.members,
			},
		};
	}

	async updateRole(roleId: string, dto: UpdateRoleDto) {
		const existing = await this.prisma.role.findUnique({
			where: { id: roleId },
		});
		if (!existing) {
			throw new NotFoundException("Role not found");
		}

		if (dto.permissionIds) {
			const count = await this.prisma.permission.count({
				where: { id: { in: dto.permissionIds } },
			});
			if (count !== dto.permissionIds.length) {
				throw new BadRequestException("One or more permissions do not exist");
			}
		}

		const updated = await this.prisma.$transaction(async (tx) => {
			if (dto.permissionIds) {
				await tx.rolePermission.deleteMany({ where: { roleId } });
				if (dto.permissionIds.length > 0) {
					await tx.rolePermission.createMany({
						data: dto.permissionIds.map((permissionId) => ({
							roleId,
							permissionId,
						})),
					});
				}
			}

			return tx.role.update({
				where: { id: roleId },
				data: {
					...(dto.name ? { name: dto.name } : {}),
					...(dto.description !== undefined ? { description: dto.description } : {}),
				},
				include: {
					organization: { select: { id: true, name: true } },
					permissions: {
						select: {
							permission: {
								select: {
									id: true,
									key: true,
									name: true,
									description: true,
									module: true,
								},
							},
						},
					},
					_count: { select: { members: true } },
				},
			});
		});

		return {
			message: "Role updated successfully",
			data: {
				...updated,
				permissions: updated.permissions.map((p) => p.permission),
				membersCount: updated._count.members,
			},
		};
	}

	async deleteRole(roleId: string) {
		const role = await this.prisma.role.findUnique({
			where: { id: roleId },
			include: { _count: { select: { members: true } } },
		});
		if (!role) {
			throw new NotFoundException("Role not found");
		}
		if (role.isSystem) {
			throw new BadRequestException("System roles cannot be deleted");
		}
		if (role._count.members > 0) {
			throw new BadRequestException(
				"Cannot delete a role that is assigned to organization members",
			);
		}

		await this.prisma.role.delete({ where: { id: roleId } });
		return { message: "Role deleted successfully" };
	}

	async listPlatformStaff() {
		const users = await this.prisma.user.findMany({
			where: { platformRoleId: { not: null } },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				profile: true,
				platformRole: { select: { id: true, name: true, isSystem: true, scope: true } },
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						organizations: true,
					},
				},
			},
		});

		return {
			message: "Platform staff fetched successfully",
			data: { items: users },
		};
	}

	async updateUserPlatformRole(
		userId: string,
		roleId: string | null,
		callerId: string,
	) {
		const caller = await this.prisma.user.findUnique({
			where: { id: callerId },
			select: { platformRole: { select: { name: true } } },
		});
		if (caller?.platformRole?.name.toLowerCase() !== "superadmin") {
			throw new ForbiddenException("Only SUPER_ADMIN can manage platform roles");
		}
		const role = roleId
			? await this.prisma.role.findUnique({
					where: { id: roleId },
					select: { name: true, scope: true },
				})
			: null;
		if (roleId && (!role || role.scope !== "PLATFORM")) {
			throw new BadRequestException("The selected role is not a platform role");
		}

		const targetUser = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, platformRole: { select: { name: true } } },
		});
		if (!targetUser) {
			throw new NotFoundException("User not found");
		}

		if (userId === callerId && role?.name.toLowerCase() !== "superadmin") {
			const superadminCount = await this.prisma.user.count({
				where: { platformRole: { name: { equals: "superadmin", mode: "insensitive" } } },
			});
			if (superadminCount <= 1) {
				throw new BadRequestException("Cannot demote the last superadmin");
			}
		}

		const updated = await this.prisma.user.update({
			where: { id: userId },
			data: { platformRoleId: roleId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				platformRole: { select: { id: true, name: true, isSystem: true, scope: true } },
				updatedAt: true,
			},
		});

		return {
			message: "Platform role updated successfully",
			data: updated,
		};
	}
}
