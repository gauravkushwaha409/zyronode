import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const rootDir = resolve(__dirname, "../../");
  const env = loadEnv(mode, rootDir, "VITE_");

  const serverUrl = env.VITE_SERVER_URL || "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 4000,
      host: true,
      proxy: {
        "/v1": {
          target: serverUrl,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(`[proxy] ${req.method} ${req.url} → ${proxyReq.host}${proxyReq.path}`);
            });
          },
        },
        "/socket.io": {
          target: serverUrl,
          changeOrigin: true,
          ws: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(`[proxy] ${req.method} ${req.url} → ${proxyReq.host}${proxyReq.path}`);
            });
          },
        },
      },
    },
    preview: {
      port: 4000,
      host: true,
      proxy: {
        "/v1": {
          target: serverUrl,
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: serverUrl,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },
    define: {
      __APP_CONFIG__: JSON.stringify({
        server_url: serverUrl,
        websocket_url: serverUrl,
        organization_id: env.VITE_ORGANIZATION_ID || "",
      }),
    },
    envDir: rootDir,
  };
});
