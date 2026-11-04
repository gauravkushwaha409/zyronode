import * as bcryptjs from "bcryptjs";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { PlatformRole } from "../../src/generated/prisma/client";
import { getSuperadminConfig } from "./config";

export async function seedSuperadmin(prisma: PrismaClient) {
	const config = getSuperadminConfig();
	const password = await bcryptjs.hash(config.password, 10);

	const user = await prisma.user.upsert({
		where: { email: config.email },
		update: {
			password,
			firstName: config.firstName,
			lastName: config.lastName,
			isEmailVerified: true,
			isOnboarded: true,
			platformRole: PlatformRole.SUPER_ADMIN,
		},
		create: {
			email: config.email,
			password,
			firstName: config.firstName,
			lastName: config.lastName,
			isEmailVerified: true,
			isOnboarded: true,
			platformRole: PlatformRole.SUPER_ADMIN,
		},
	});

	return { user, config };
}
