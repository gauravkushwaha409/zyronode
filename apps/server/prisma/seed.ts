import * as path from "node:path";
import * as dotenv from "dotenv";

// Resolved from cwd (npm scripts run with cwd = apps/server), not __dirname,
// since __dirname's depth shifts depending on how this file was compiled.
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import * as bcryptjs from "bcryptjs";
import { PlanType, PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const TEST_USER = {
	email: "test@chatboq.dev",
	password: "Test@12345",
	firstName: "Test",
	lastName: "User",
};

// First org becomes the user's active (lastOrgId) org; the rest just exist
// so the sidebar's organization switcher has something to show.
const TEST_ORGANIZATIONS: Array<{
	name: string;
	website: string;
	industry: string;
	plan: PlanType;
}> = [
	{
		name: "Gaurav Tech",
		website: "https://gauravtech.com",
		industry: "Software",
		plan: PlanType.PRO,
	},
	{
		name: "Acme Inc",
		website: "https://acme.test",
		industry: "E-commerce",
		plan: PlanType.FREE,
	},
];

async function seedTestUser() {
	const hashedPassword = await bcryptjs.hash(TEST_USER.password, 10);

	return prisma.user.upsert({
		where: { email: TEST_USER.email },
		update: {},
		create: {
			email: TEST_USER.email,
			password: hashedPassword,
			firstName: TEST_USER.firstName,
			lastName: TEST_USER.lastName,
			isEmailVerified: true,
			isOnboarded: true,
		},
	});
}

async function seedOrganizationForUser(
	userId: string,
	org: (typeof TEST_ORGANIZATIONS)[number],
) {
	const organization =
		(await prisma.organization.findFirst({ where: { name: org.name } })) ??
		(await prisma.organization.create({ data: org }));

	await prisma.organizationMember.upsert({
		where: {
			userId_organizationId: { userId, organizationId: organization.id },
		},
		update: {},
		create: { userId, organizationId: organization.id },
	});

	return organization;
}

async function main() {
	const user = await seedTestUser();

	const organizations: Array<
		Awaited<ReturnType<typeof seedOrganizationForUser>>
	> = [];
	for (const org of TEST_ORGANIZATIONS) {
		const organization = await seedOrganizationForUser(user.id, org);
		organizations.push(organization);
	}

	await prisma.user.update({
		where: { id: user.id },
		data: { lastOrgId: organizations[0].id },
	});

	console.log("Seeded test user:");
	console.log(`  email:    ${TEST_USER.email}`);
	console.log(`  password: ${TEST_USER.password}`);
	console.log(`  orgs:     ${organizations.map((o) => o.name).join(", ")}`);
	console.log(
		`  app:      http://localhost:3000/${organizations[0].id}/dashboard (after logging in)`,
	);
}

main()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
