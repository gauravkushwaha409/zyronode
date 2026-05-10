# apps/frontend/Dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm

# ─── deps stage ───────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ui/package.json ./packages/ui/
COPY packages/react-hook-form/package.json ./packages/react-hook-form/
COPY packages/tanstack-react-query/package.json ./packages/tanstack-react-query/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

# ─── build stage ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# root node_modules
COPY --from=deps /app/node_modules ./node_modules

# app node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

# ✅ packages node_modules — this was missing!
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/react-hook-form/node_modules ./packages/react-hook-form/node_modules
COPY --from=deps /app/packages/tanstack-react-query/node_modules ./packages/tanstack-react-query/node_modules
COPY --from=deps /app/packages/api-client/node_modules ./packages/api-client/node_modules

# copy all source
COPY . .

WORKDIR /app/apps/frontend
RUN pnpm build

# ─── production stage (nginx) ─────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]