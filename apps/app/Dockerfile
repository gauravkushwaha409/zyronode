# apps/app/Dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm

# ─── deps stage ───────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/app/package.json ./apps/app/
COPY packages/ui/package.json ./packages/ui/
COPY packages/react-hook-form/package.json ./packages/react-hook-form/
COPY packages/tanstack-react-query/package.json ./packages/tanstack-react-query/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "dev:app"]