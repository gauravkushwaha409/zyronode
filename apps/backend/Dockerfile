# apps/backend/Dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm

# ─── deps stage ───────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# backend app
COPY apps/backend/package.json ./apps/backend/

# only packages backend actually uses
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

# ─── build stage ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

COPY . .

WORKDIR /app/apps/backend
RUN pnpm dlx prisma generate
RUN pnpm build

# ─── production stage ─────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]