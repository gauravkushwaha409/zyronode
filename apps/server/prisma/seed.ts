import * as path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { getSeedMode } from "./seed/config";
import { parseSeedTargets, runSeedTargets } from "./seed/targets";

const mode = getSeedMode();

dotenv.config({
	path: path.resolve(process.cwd(), `../../env/.env.${mode}`),
	quiet: true,
});

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
	const targets = parseSeedTargets(process.env.SEED_TARGETS);

	if (mode === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
		throw new Error(
			"Refusing to seed production. Set ALLOW_PRODUCTION_SEED=true to continue.",
		);
	}

	const summary = await runSeedTargets(prisma, mode, targets);

	console.log(`Seed completed (${mode}): ${targets.join(", ")}`);

	if (summary.superadmin) {
		console.log(`  superadmin: ${summary.superadmin.email}`);
		console.log(`  password:   ${summary.superadmin.password}`);
		console.log(
			`  admin:      http://localhost:${process.env.ADMIN_PORT ?? "5000"}/auth/login`,
		);
	}

	if (summary.user) {
		console.log(`  user:       ${summary.user.email}`);
		console.log(`  password:   ${summary.user.password}`);
	}

	if (summary.roles) {
		console.log(
			`  roles:      ${summary.roles.roles} roles, ${summary.roles.permissions} permissions`,
		);
	}
}

main()
	.catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		if (!process.env.SEED_TARGETS?.trim()) {
			console.error(
				"Choose an explicit target, for example: pnpm prisma:development:seed:superadmin",
			);
		}
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
