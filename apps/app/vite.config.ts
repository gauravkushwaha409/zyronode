import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const viteEnv = loadEnv(mode, "../../", "VITE_");
	const allEnv = loadEnv(mode, "../../", "");

	const serverUrl = viteEnv.VITE_SERVER_URL;
	const enableProxy = (allEnv.PROXY ?? process.env.PROXY) === "true";
	console.log("serverUrl", serverUrl);
	console.log("proxy enabled:", enableProxy);

	return {
		envDir: "../../",
		server: {
			port: 3000,
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
