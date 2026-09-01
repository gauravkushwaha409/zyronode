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

// Spread across countries/devices so the Geo-IP map, the by-country and
// top-pages aggregations, and the table filters all have something to show.
const TEST_VISITORS = [
	{
		externalId: "vis_kathmandu_01",
		name: "Raja Swarnakar",
		email: "raja@example.com",
		phone: "+977 9800000001",
		ipAddress: "27.34.68.10",
		isOnline: true,
		isIdentified: true,
		visitCount: 12,
		activeDuration: 2100,
		currentPage: "/pricing",
		device: "Mac",
		deviceType: "desktop",
		browser: "chrome",
		os: "macOS",
		country: "Nepal",
		countryCode: "NP",
		city: "Kathmandu",
		region: "P3",
		regionName: "Bagmati",
		timezone: "Asia/Kathmandu",
		latitude: 27.7172,
		longitude: 85.324,
		pages: ["/", "/pricing", "/docs"],
	},
	{
		externalId: "vis_sf_02",
		name: "Alicia Moore",
		email: "alicia@example.com",
		phone: null,
		ipAddress: "104.28.14.9",
		isOnline: true,
		isIdentified: true,
		visitCount: 4,
		activeDuration: 640,
		currentPage: "/docs",
		device: "MacBook Pro",
		deviceType: "desktop",
		browser: "safari",
		os: "macOS",
		country: "United States",
		countryCode: "US",
		city: "San Francisco",
		region: "CA",
		regionName: "California",
		timezone: "America/Los_Angeles",
		latitude: 37.7749,
		longitude: -122.4194,
		pages: ["/", "/docs"],
	},
	{
		externalId: "vis_london_03",
		name: null,
		email: null,
		phone: null,
		ipAddress: "81.2.69.142",
		isOnline: false,
		isIdentified: false,
		visitCount: 1,
		activeDuration: 95,
		currentPage: "/",
		device: "iPhone",
		deviceType: "mobile",
		browser: "safari",
		os: "iOS",
		country: "United Kingdom",
		countryCode: "GB",
		city: "London",
		region: "ENG",
		regionName: "England",
		timezone: "Europe/London",
		latitude: 51.5074,
		longitude: -0.1278,
		pages: ["/"],
	},
	{
		externalId: "vis_bengaluru_04",
		name: "Nahakul Thapa",
		email: "nahakul@example.com",
		phone: "+91 9800000004",
		ipAddress: "49.207.60.22",
		isOnline: true,
		isIdentified: true,
		visitCount: 7,
		activeDuration: 1280,
		currentPage: "/pricing",
		device: "Pixel 8",
		deviceType: "mobile",
		browser: "chrome",
		os: "Android",
		country: "India",
		countryCode: "IN",
		city: "Bengaluru",
		region: "KA",
		regionName: "Karnataka",
		timezone: "Asia/Kolkata",
		latitude: 12.9716,
		longitude: 77.5946,
		pages: ["/", "/pricing", "/pricing"],
	},
	{
		externalId: "vis_berlin_05",
		name: null,
		email: null,
		phone: null,
		ipAddress: "91.64.12.7",
		isOnline: false,
		isIdentified: false,
		visitCount: 2,
		activeDuration: 310,
		currentPage: "/integrations",
		device: "ThinkPad",
		deviceType: "desktop",
		browser: "firefox",
		os: "Linux",
		country: "Germany",
		countryCode: "DE",
		city: "Berlin",
		region: "BE",
		regionName: "Berlin",
		timezone: "Europe/Berlin",
		latitude: 52.52,
		longitude: 13.405,
		pages: ["/", "/integrations"],
	},
	{
		externalId: "vis_sydney_06",
		name: "Puja Basnet",
		email: "puja@example.com",
		phone: null,
		ipAddress: "1.128.96.4",
		isOnline: false,
		isIdentified: true,
		visitCount: 3,
		activeDuration: 470,
		currentPage: "/docs",
		device: "iPad",
		deviceType: "tablet",
		browser: "safari",
		os: "iPadOS",
		country: "Australia",
		countryCode: "AU",
		city: "Sydney",
		region: "NSW",
		regionName: "New South Wales",
		timezone: "Australia/Sydney",
		latitude: -33.8688,
		longitude: 151.2093,
		pages: ["/docs"],
	},
	{
		externalId: "vis_toronto_07",
		name: "Jackson Pokharel",
		email: "jackson@example.com",
		phone: "+1 4160000007",
		ipAddress: "99.240.18.3",
		isOnline: true,
		isIdentified: true,
		visitCount: 9,
		activeDuration: 1830,
		currentPage: "/",
		device: "Surface",
		deviceType: "desktop",
		browser: "edge",
		os: "Windows",
		country: "Canada",
		countryCode: "CA",
		city: "Toronto",
		region: "ON",
		regionName: "Ontario",
		timezone: "America/Toronto",
		latitude: 43.6532,
		longitude: -79.3832,
		pages: ["/", "/pricing"],
	},
	{
		externalId: "vis_saopaulo_08",
		name: null,
		email: null,
		phone: null,
		ipAddress: "177.12.44.8",
		isOnline: false,
		isIdentified: false,
		visitCount: 1,
		activeDuration: 45,
		currentPage: "/docs",
		device: "Galaxy S22",
		deviceType: "mobile",
		browser: "chrome",
		os: "Android",
		country: "Brazil",
		countryCode: "BR",
		city: "São Paulo",
		region: "SP",
		regionName: "São Paulo",
		timezone: "America/Sao_Paulo",
		latitude: -23.5505,
		longitude: -46.6333,
		pages: ["/docs"],
	},
];

/**
 * Note: presence is derived as `isOnline && lastSeenAt within 60s`, so the
 * "online" visitors here go stale a minute after seeding. Re-run
 * `pnpm prisma:seed` to refresh them.
 */
async function seedVisitorsForOrganization(
	organizationId: string,
	agentUserId: string,
) {
	const now = Date.now();
	const seeded: Array<{ id: string; name: string | null }> = [];

	for (const [index, spec] of TEST_VISITORS.entries()) {
		const { pages, ...visitorData } = spec;

		// offline visitors get a progressively older lastSeenAt so the
		// list ordering (lastSeenAt desc) is stable and meaningful
		const lastSeenAt = spec.isOnline
			? new Date(now - index * 1000)
			: new Date(now - (index + 1) * 45 * 60 * 1000);

		const visitor = await prisma.visitor.upsert({
			where: {
				organizationId_externalId: {
					organizationId,
					externalId: spec.externalId,
				},
			},
			update: { isOnline: spec.isOnline, lastSeenAt },
			create: { ...visitorData, organizationId, lastSeenAt },
		});

		// page visits are only created once, so re-running the seed does not
		// keep inflating the top-pages counts
		const existingVisits = await prisma.visitorPageVisit.count({
			where: { visitorId: visitor.id },
		});
		if (existingVisits === 0) {
			await prisma.visitorPageVisit.createMany({
				data: pages.map((url, pageIndex) => ({
					visitorId: visitor.id,
					url,
					pageTitle: url === "/" ? "Home" : url.replace("/", "").toUpperCase(),
					enteredAt: new Date(now - (pages.length - pageIndex) * 60 * 1000),
					durationSeconds: 60 + pageIndex * 30,
				})),
			});
		}

		seeded.push({ id: visitor.id, name: visitor.name });
	}

	// one note on the first visitor so the notes panel is not empty
	const firstVisitor = seeded[0];
	if (firstVisitor) {
		const noteCount = await prisma.visitorNote.count({
			where: { visitorId: firstVisitor.id },
		});
		if (noteCount === 0) {
			await prisma.visitorNote.create({
				data: {
					visitorId: firstVisitor.id,
					authorId: agentUserId,
					content:
						"Asked about annual pricing on the Pro plan. Following up over email.",
				},
			});
		}

		// a conversation linked to the visitor, for the Agent Chat tab
		const existingConversation = await prisma.conversation.findFirst({
			where: { visitorId: firstVisitor.id },
		});
		if (!existingConversation) {
			const conversation = await prisma.conversation.create({
				data: {
					organizationId,
					visitorId: firstVisitor.id,
					visitorName: firstVisitor.name,
					channel: "web",
					sourceUrl: "/pricing",
				},
			});
			await prisma.message.createMany({
				data: [
					{
						conversationId: conversation.id,
						senderType: "VISITOR",
						content: "Hi, is there an annual discount on the Pro plan?",
						createdAt: new Date(now - 8 * 60 * 1000),
					},
					{
						conversationId: conversation.id,
						senderType: "AGENT",
						senderId: agentUserId,
						content: "Hey! Yes — 20% off when billed annually.",
						createdAt: new Date(now - 6 * 60 * 1000),
					},
					{
						conversationId: conversation.id,
						senderType: "VISITOR",
						content: "Great, can you send me the link?",
						createdAt: new Date(now - 4 * 60 * 1000),
					},
				],
			});
		}
	}

	return seeded.length;
}

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

	// visitors only on the active org - that is the one the app opens on
	const visitorCount = await seedVisitorsForOrganization(
		organizations[0].id,
		user.id,
	);

	console.log("Seeded test user:");
	console.log(`  email:    ${TEST_USER.email}`);
	console.log(`  password: ${TEST_USER.password}`);
	console.log(`  orgs:     ${organizations.map((o) => o.name).join(", ")}`);
	console.log(`  visitors: ${visitorCount} on ${organizations[0].name}`);
	console.log(
		`  app:      http://localhost:${process.env.APP_PORT ?? "3000"}/${organizations[0].id}/dashboard (after logging in)`,
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
