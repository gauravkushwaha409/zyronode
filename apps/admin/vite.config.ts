import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function expandEnv(
	value: string | undefined,
	env: Record<string, string>,
): string | undefined {
	if (!value) return value;
	return value.replace(
		/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g,
		(_, b, c) => env[b ?? c] ?? process.env[b ?? c] ?? "",
	);
}

export default defineConfig(({ mode }) => {
	const viteEnv = loadEnv(mode, "../../env", "VITE_");
	const allEnv = loadEnv(mode, "../../env", "");

	const adminPortRaw =
		allEnv.ADMIN_PORT ??
		viteEnv.VITE_ADMIN_PORT ??
		process.env.ADMIN_PORT ??
		"3001";
	const adminPort =
		Number.parseInt(expandEnv(adminPortRaw, allEnv) ?? "3001", 10) || 3001;

	return {
		envDir: "../../env",
		server: {
			port: adminPort,
			host: true,
		},
		plugins: [
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
			}),
			react(),
			tailwindcss(),
		],
		css: {
			transformer: "postcss",
		},
		resolve: {
			tsconfigPaths: true,
		},
	};
});
