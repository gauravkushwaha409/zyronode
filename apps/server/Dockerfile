# apps/backend/Dockerfile.dev
FROM node:22-alpine
RUN npm install -g pnpm

WORKDIR /app

# copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

# copy source
COPY . .

WORKDIR /app/apps/backend

RUN pnpm prisma:generate

EXPOSE 3000

CMD ["pnpm", "run", "dev"]