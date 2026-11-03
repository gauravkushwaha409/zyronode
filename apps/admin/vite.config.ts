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
		"5000";
	const adminPort =
		Number.parseInt(expandEnv(adminPortRaw, allEnv) ?? "5000", 10) || 5000;

	const serverPort = allEnv.SERVER_PORT ?? process.env.SERVER_PORT ?? "8000";
	const serverUrl =
		expandEnv(viteEnv.VITE_SERVER_URL, allEnv) ||
		`http://localhost:${serverPort}`;
	const enableProxy = (allEnv.PROXY ?? process.env.PROXY) === "true";

	return {
		envDir: "../../env",
		server: {
			port: adminPort,
			host: true,
			...(enableProxy && {
				proxy: {
					"/api/v1": {
						target: serverUrl,
						changeOrigin: true,
					},
				},
			}),
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
		define: {
			__PROXY_ENABLED__: enableProxy,
			__SERVER_URL__: JSON.stringify(serverUrl),
		},
		resolve: {
			tsconfigPaths: true,
		},
	};
});
