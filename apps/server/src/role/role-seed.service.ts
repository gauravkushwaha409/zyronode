import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PERMISSION_SEEDS, SYSTEM_ROLE_SEEDS } from "./role.seeds";

/**
 * Seeds the global permission registry and immutable system roles on boot.
 * Idempotent and additive:
 *  - permissions are upserted by `key`
 *  - system roles (organizationId = null) are created if missing and their
 *    permission set is reconciled to the template every boot so the matrix
 *    stays authoritative. Custom (organization-scoped) roles are never touched.
 */
@Injectable()
export class RoleSeedService implements OnModuleInit {
	private readonly logger = new Logger(RoleSeedService.name);

	constructor(private readonly prisma: PrismaService) {}

	async onModuleInit(): Promise<void> {
		try {
			await this.seed();
			this.logger.log(
				`Seeded ${PERMISSION_SEEDS.length} permissions, ${SYSTEM_ROLE_SEEDS.length} system roles`,
			);
		} catch (err) {
			this.logger.error(`Failed to seed roles/permissions: ${(err as Error).message}`);
		}
	}

	private async seed(): Promise<void> {
		for (const p of PERMISSION_SEEDS) {
			await this.prisma.permission.upsert({
				where: { key: p.key },
				update: { name: p.name, description: p.description, module: p.module },
				create: { ...p },
			});
		}

		for (const role of SYSTEM_ROLE_SEEDS) {
			const permissionIds = await this.prisma.permission.findMany({
				where: { key: { in: role.permissions } },
				select: { id: true },
			});

			const existing = await this.prisma.role.findFirst({
				where: { name: role.name, organizationId: null },
			});

			if (existing) {
				await this.prisma.role.update({
					where: { id: existing.id },
					data: {
						description: role.description,
						permissions: {
							deleteMany: {},
							createMany: { data: permissionIds.map((p) => ({ permissionId: p.id })) },
						},
					},
				});
			} else {
				await this.prisma.role.create({
					data: {
						name: role.name,
						description: role.description,
						isSystem: true,
						organizationId: null,
						permissions: {
							createMany: { data: permissionIds.map((p) => ({ permissionId: p.id })) },
						},
					},
				});
			}
		}
	}
}