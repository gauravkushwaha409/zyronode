import type { PrismaClient } from "../../src/generated/prisma/client";
import { assertProductionCredentials, type SeedMode } from "./config";
import { seedRoles } from "./roles";
import { seedSuperadmin } from "./superadmin";
import { seedUser } from "./user";

export const SEED_TARGETS = ["superadmin", "user", "roles"] as const;

export type SeedTarget = (typeof SEED_TARGETS)[number];

export interface SeedSummary {
	superadmin?: {
		email: string;
		password: string;
	};
	user?: {
		email: string;
		password: string;
	};
	roles?: {
		roles: number;
		permissions: number;
	};
}

export function parseSeedTargets(raw: string | undefined): SeedTarget[] {
	if (!raw?.trim()) {
		throw new Error(
			"SEED_TARGETS is required. Choose one or more of: superadmin, user, roles.",
		);
	}

	const targets = [
		...new Set(
			raw
				.split(",")
				.map((target) => target.trim())
				.filter(Boolean),
		),
	];

	const invalid = targets.filter(
		(target) => !SEED_TARGETS.includes(target as SeedTarget),
	);
	if (invalid.length > 0) {
		throw new Error(
			`Invalid SEED_TARGETS: ${invalid.join(", ")}. Choose from: ${SEED_TARGETS.join(", ")}.`,
		);
	}

	return targets as SeedTarget[];
}

export async function runSeedTargets(
	prisma: PrismaClient,
	mode: SeedMode,
	targets: SeedTarget[],
): Promise<SeedSummary> {
	if (mode === "production") {
		assertProductionCredentials(targets);
	}

	const summary: SeedSummary = {};

	for (const target of targets) {
		switch (target) {
			case "superadmin": {
				const result = await seedSuperadmin(prisma);
				summary.superadmin = {
					email: result.config.email,
					password: result.config.password,
				};
				break;
			}
			case "user": {
				const result = await seedUser(prisma);
				summary.user = {
					email: result.config.email,
					password: result.config.password,
				};
				break;
			}
			case "roles": {
				summary.roles = await seedRoles(prisma);
				break;
			}
		}
	}

	return summary;
}
