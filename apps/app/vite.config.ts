// apps/frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),




  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@package/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@package/react-hook-form": path.resolve(__dirname, "../../packages/react-hook-form/src/index.ts"),
      "@package/tanstack-react-query": path.resolve(__dirname, "../../packages/tanstack-react-query/src/index.ts"),
      "@package/api-client": path.resolve(__dirname, "../../packages/api-client/src/index.ts")
    }
  }
})
