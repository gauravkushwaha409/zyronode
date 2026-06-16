import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, "../../", "VITE_");

	const serverUrl = env.VITE_SERVER_URL;

	return {
		server: {
			port: 3000,
			host: true,
			proxy: {
				"/api/v1": {
					target: serverUrl,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api\/v1/, ""),
				},
			},
		},
		plugins: [
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
			}),
			react(),
			tailwindcss(),
		],
		resolve: {
			tsconfigPaths: true, // resolve the path via tsconfig.json
		},
	};
});
