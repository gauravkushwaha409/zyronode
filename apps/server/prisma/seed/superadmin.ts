import * as bcryptjs from "bcryptjs";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { getSuperadminConfig } from "./config";
import { SYSTEM_ROLE_IDS } from "../../src/role/role.constants";

export async function seedSuperadmin(prisma: PrismaClient) {
	const config = getSuperadminConfig();
	const password = await bcryptjs.hash(config.password, 10);

	await prisma.role.upsert({
		where: { id: SYSTEM_ROLE_IDS.SUPERADMIN },
		update: { name: "superadmin", isSystem: true, scope: "PLATFORM", organizationId: null },
		create: {
			id: SYSTEM_ROLE_IDS.SUPERADMIN,
			name: "superadmin",
			description: "Full access to the platform administration surface.",
			isSystem: true,
			scope: "PLATFORM",
		},
	});

	const user = await prisma.user.upsert({
		where: { email: config.email },
		update: {
			password,
			firstName: config.firstName,
			lastName: config.lastName,
			isEmailVerified: true,
			isOnboarded: true,
			platformRole: { connect: { id: SYSTEM_ROLE_IDS.SUPERADMIN } },
		},
		create: {
			email: config.email,
			password,
			firstName: config.firstName,
			lastName: config.lastName,
			isEmailVerified: true,
			isOnboarded: true,
			platformRole: { connect: { id: SYSTEM_ROLE_IDS.SUPERADMIN } },
		},
	});

	return { user, config };
}
