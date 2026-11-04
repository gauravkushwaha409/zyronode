export type SeedMode = "development" | "production";

export interface SeedUserConfig {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

const DEFAULT_USER: SeedUserConfig = {
	email: "user@gmail.com",
	password: "User@12345",
	firstName: "Demo",
	lastName: "User",
};

export function getSeedMode(): SeedMode {
	const mode = process.env.SEED_MODE?.toLowerCase();

	if (!mode) {
		throw new Error("SEED_MODE is required. Use development or production.");
	}

	if (mode !== "development" && mode !== "production") {
		throw new Error(
			`Invalid SEED_MODE "${mode}". Use development or production.`,
		);
	}

	return mode;
}

export function getSuperadminConfig(): SeedUserConfig {
	const email = process.env.SEED_SUPERADMIN_EMAIL?.trim();
	const password = process.env.SEED_SUPERADMIN_PASSWORD;
	const firstName = process.env.SEED_SUPERADMIN_FIRST_NAME?.trim();
	const lastName = process.env.SEED_SUPERADMIN_LAST_NAME?.trim();
	if (!email || !password || !firstName || !lastName) {
		const missing = [
			!email && "SEED_SUPERADMIN_EMAIL",
			!password && "SEED_SUPERADMIN_PASSWORD",
			!firstName && "SEED_SUPERADMIN_FIRST_NAME",
			!lastName && "SEED_SUPERADMIN_LAST_NAME",
		].filter(Boolean);

		throw new Error(
			`Missing superadmin seed credentials: ${missing.join(", ")}.`,
		);
	}

	return { email, password, firstName, lastName };
}

export function getUserConfig(): SeedUserConfig {
	return {
		email: process.env.SEED_USER_EMAIL ?? DEFAULT_USER.email,
		password: process.env.SEED_USER_PASSWORD ?? DEFAULT_USER.password,
		firstName: process.env.SEED_USER_FIRST_NAME ?? DEFAULT_USER.firstName,
		lastName: process.env.SEED_USER_LAST_NAME ?? DEFAULT_USER.lastName,
	};
}

export function assertProductionCredentials(targets: string[]) {
	if (targets.includes("superadmin")) {
		getSuperadminConfig();
	}

	if (targets.includes("user")) {
		if (!process.env.SEED_USER_EMAIL) {
			throw new Error(
				"SEED_USER_EMAIL is required when seeding a user in production.",
			);
		}
		if (
			!process.env.SEED_USER_PASSWORD ||
			getUserConfig().password === DEFAULT_USER.password
		) {
			throw new Error(
				"SEED_USER_PASSWORD must be set to a non-default value when seeding a user in production.",
			);
		}
	}
}
