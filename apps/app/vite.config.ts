import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/

function expandEnv(value: string | undefined, env: Record<string, string>): string | undefined {
	if (!value) return value;
	return value.replace(/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g, (_, b, c) => env[b ?? c] ?? process.env[b ?? c] ?? "");
}

export default defineConfig(({ mode }) => {
	const viteEnv = loadEnv(mode, "../../env", "VITE_");
	const allEnv = loadEnv(mode, "../../env", "");
	console.log("viteEnv", viteEnv);
	console.log("allEnv", allEnv);

	const serverPort = allEnv.SERVER_PORT ?? process.env.SERVER_PORT ?? "8000";
	const appPortRaw = allEnv.APP_PORT ?? viteEnv.VITE_PORT ?? process.env.APP_PORT ?? "3000";
	const appPort = Number.parseInt(expandEnv(appPortRaw, allEnv) ?? "3000", 10) || 3000;

	// Support ${SERVER_PORT} placeholder in VITE_SERVER_URL (e.g. http://localhost:${SERVER_PORT})
	const rawServerUrl = viteEnv.VITE_SERVER_URL;
	const expandedServerUrl = expandEnv(rawServerUrl, allEnv);
	const serverUrl = expandedServerUrl || `http://localhost:${serverPort}`;

	const enableProxy = (allEnv.PROXY ?? process.env.PROXY) === "true";
	console.log("serverUrl", serverUrl);
	console.log("proxy enabled:", enableProxy);
	console.log("appPort", appPort, "serverPort", serverPort);

	return {
		envDir: "../../env",
		server: {
			port: appPort,
			host: true,
			...(enableProxy && {
				proxy: {
					"/api/v1": {
						target: serverUrl,
						changeOrigin: true,
					},
					"/socket.io": {
						target: serverUrl,
						changeOrigin: true,
						ws: true,
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
		define: {
			__PROXY_ENABLED__: enableProxy,
			__SERVER_URL__: JSON.stringify(serverUrl),
		},
		resolve: {
			tsconfigPaths: true, // resolve the path via tsconfig.json
		},
	};
});
