import * as bcryptjs from "bcryptjs";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { PlatformRole } from "../../src/generated/prisma/client";
import { getUserConfig } from "./config";

export async function seedUser(prisma: PrismaClient) {
	const config = getUserConfig();
	const password = await bcryptjs.hash(config.password, 10);

	const user = await prisma.user.upsert({
		where: { email: config.email },
		update: {
			password,
			firstName: config.firstName,
			lastName: config.lastName,
			isEmailVerified: true,
			isOnboarded: true,
		},
		create: {
			email: config.email,
			password,
			firstName: config.firstName,
			lastName: config.lastName,
			isEmailVerified: true,
			isOnboarded: true,
			platformRole: PlatformRole.NONE,
		},
	});

	return { user, config };
}
