import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
<<<<<<< HEAD
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
=======
export default defineConfig(({ mode}) => {
  const env = loadEnv(mode, process.cwd());

  const serverUrl = env.VITE_SERVER_URL || "http://localhost:8000";
  return {
    server: {
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
>>>>>>> aa0ae39436f94f403c27c3fac8ca0f288e951f80
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
