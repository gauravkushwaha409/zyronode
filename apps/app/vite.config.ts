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
      "@packages/react-hook-form": path.resolve(__dirname, "../../packages/react-hook-form/src/index.ts")
    }
  }
})
