import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, "../../", "VITE_");

	const serverUrl = env.VITE_SERVER_URL;

	return {
		envDir: "../../",
		server: {
			port: 3000,
			host: true,
			proxy: {
				"/v1": {
					target: serverUrl,
					changeOrigin: true,
				},
				"/socket.io": {
					target: serverUrl,
					changeOrigin: true,
					ws: true,
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
