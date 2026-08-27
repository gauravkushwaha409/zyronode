import * as dotenv from "dotenv";
import * as path from "node:path";
import { defineConfig } from "prisma/config";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsc -p tsconfig.seed.json && node dist-seed/prisma/seed.js",
	},
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
