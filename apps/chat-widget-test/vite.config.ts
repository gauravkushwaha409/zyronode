import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function expandEnv(value: string | undefined, env: Record<string, string>): string | undefined {
  if (!value) return value;
  return value.replace(/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g, (_, b, c) => env[b ?? c] ?? process.env[b ?? c] ?? "");
}

export default defineConfig(({ mode }) => {
  const envDir = resolve(__dirname, "../../env");
  const env = loadEnv(mode, envDir, "VITE_");
  const allEnv = loadEnv(mode, envDir, "");

  const serverPort = allEnv.SERVER_PORT ?? process.env.SERVER_PORT ?? "8000";
  const chatWidgetPortRaw = allEnv.CHAT_WIDGET_PORT ?? env.VITE_CHAT_WIDGET_PORT ?? process.env.CHAT_WIDGET_PORT ?? "4000";
  const chatWidgetPort = Number.parseInt(expandEnv(chatWidgetPortRaw, allEnv) ?? "4000", 10) || 4000;

  const rawServerUrl = env.VITE_CHAT_WIDGET_SERVER_URL;
  const rawWebsocketUrl = env.VITE_CHAT_WIDGET_WEBSOCKET_URL;
  const serverUrl = expandEnv(rawServerUrl, allEnv) || rawServerUrl || `http://localhost:${serverPort}`;
  const websocketUrl = expandEnv(rawWebsocketUrl, allEnv) || rawWebsocketUrl || `http://localhost:${serverPort}`;
  const organizationId = env.VITE_ORGANIZATION_ID

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: chatWidgetPort,
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
      port: chatWidgetPort,
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
        websocket_url: websocketUrl,
        organization_id: organizationId,
      }),
    },
    envDir,
  };
});
