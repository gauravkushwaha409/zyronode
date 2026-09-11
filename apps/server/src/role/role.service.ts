import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

const ROLE_INCLUDE = {
	permissions: {
		select: {
			permission: {
				select: {
					id: true,
					key: true,
					name: true,
					module: true,
				},
			},
		},
	},
	_count: { select: { members: true } },
} as const;

const NOT_ORGANIZATION_MEMBER = "You are not a member of this organization";
const SYSTEM_ROLE_IMMUTABLE = "System roles cannot be modified";

@Injectable()
export class RoleService {
	constructor(private readonly prisma: PrismaService) {}

	async listRoles(organizationId: string, userId: string) {
		await this.assertMembership(organizationId, userId);

		const roles = await this.prisma.role.findMany({
			where: { OR: [{ organizationId }, { organizationId: null }] },
			orderBy: [{ isSystem: "asc" }, { name: "asc" }],
			include: ROLE_INCLUDE,
		});

		return roles.map(({ permissions, _count, ...role }) => ({
			...role,
			permissions: permissions.map((p) => p.permission),
			membersCount: _count.members,
		}));
	}

	async listPermissions() {
		return this.prisma.permission.findMany({
			orderBy: [{ module: "asc" }, { name: "asc" }],
			select: {
				id: true,
				key: true,
				name: true,
				description: true,
				module: true,
			},
		});
	}

	/** Permissions for a member of the org — membership gate keeps the registry tenant-safe. */
	async listPermissionsInOrg(organizationId: string, userId: string) {
		await this.assertMembership(organizationId, userId);
		return this.listPermissions();
	}

	async createRole(organizationId: string, userId: string, dto: CreateRoleDto) {
		await this.assertMembership(organizationId, userId);
		await this.assertPermissionsExist(dto.permissionIds);

		const role = await this.prisma.role.create({
			data: {
				name: dto.name,
				description: dto.description,
				organizationId,
				permissions: {
					createMany: {
						data: dto.permissionIds.map((permissionId) => ({ permissionId })),
					},
				},
			},
			include: ROLE_INCLUDE,
		});

		return this.flatten(role);
	}

	async updateRole(
		organizationId: string,
		userId: string,
		roleId: string,
		dto: UpdateRoleDto,
	) {
		await this.assertMembership(organizationId, userId);
		if (dto.permissionIds) {
			await this.assertPermissionsExist(dto.permissionIds);
		}

		const existing = await this.findEditableRole(roleId, organizationId);

		const role = await this.prisma.role.update({
			where: { id: existing.id },
			data: {
				name: dto.name,
				description: dto.description,
				...(dto.permissionIds && {
					permissions: {
						deleteMany: {},
						createMany: {
							data: dto.permissionIds.map((permissionId) => ({ permissionId })),
						},
					},
				}),
			},
			include: ROLE_INCLUDE,
		});

		return this.flatten(role);
	}

	async deleteRole(organizationId: string, userId: string, roleId: string) {
		await this.assertMembership(organizationId, userId);
		const existing = await this.findEditableRole(roleId, organizationId);

		const membersCount = await this.prisma.organizationMember.count({
			where: { roleId: existing.id },
		});
		if (membersCount > 0) {
			throw new ConflictException({
				message: "Role is assigned to members and cannot be deleted",
				error_code: "ROLE_IN_USE",
			});
		}

		await this.prisma.role.delete({ where: { id: existing.id } });
		return { id: existing.id };
	}

	/**
	 * A custom, organization-scoped role. System and cross-tenant roles are
	 * rejected so one organization can never mutate another's — or the
	 * platform's — roles.
	 */
	private async findEditableRole(roleId: string, organizationId: string) {
		const role = await this.prisma.role.findUnique({
			where: { id: roleId },
			select: { id: true, isSystem: true, organizationId: true },
		});
		if (!role || role.organizationId !== organizationId) {
			throw new NotFoundException({ message: "Role not found", error_code: "ROLE_NOT_FOUND" });
		}
		if (role.isSystem) {
			throw new ForbiddenException({
				message: SYSTEM_ROLE_IMMUTABLE,
				error_code: "SYSTEM_ROLE_IMMUTABLE",
			});
		}
		return role;
	}

	private async assertPermissionsExist(permissionIds: string[]) {
		const found = await this.prisma.permission.count({
			where: { id: { in: permissionIds } },
		});
		if (found !== permissionIds.length) {
			throw new BadRequestException({
				message: "One or more permission ids are invalid",
				error_code: "INVALID_PERMISSION_IDS",
			});
		}
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

	private flatten(role: {
		permissions: { permission: { id: string; key: string; name: string; module: string } }[];
		_count: { members: number };
	}) {
		return {
			...role,
			permissions: role.permissions.map((p) => p.permission),
			membersCount: role._count.members,
		};
	}
}