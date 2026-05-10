// path: apps/frontend/tailwind.config.ts
export default {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',  // ✅ scan ui package too
  ],
}