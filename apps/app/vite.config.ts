import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig(({ mode}) => {
  const env = loadEnv(mode, process.cwd());

  const serverUrl = env.VITE_SERVER_URL || "http://localhost:8000";
  return {
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
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
  }
})
