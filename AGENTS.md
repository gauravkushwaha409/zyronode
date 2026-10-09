# AGENTS.md

## Commands

- **Install:** `pnpm install` (requires `pnpm@11.3.0`, `node>=18`)
- **Dev all:** `pnpm dev` (turbo) — starts `app` + `server` + `chat-widget-test`
- **Dev filtered:** `pnpm dev:app` | `pnpm dev:server` | `pnpm dev:chat-widget` (wrappers for `turbo dev --filter <pkg>`)
- **Build:** `pnpm build` (`turbo build`, respects `dependsOn: ^build`)
- **Single package build:** `pnpm --filter <name> build` or `turbo build --filter=<name>`
- **Typecheck:** `pnpm check-types` (`turbo run check-types` — only `app` has this task; server uses `tsc --noEmit` via tsconfig)
- **Lint:** `pnpm lint` (`biome lint .`)
- **Format:** `pnpm format` (`biome format --write .`) — **tabs**, double quotes
- **Lint+format+organizeImports:** `pnpm check` (`biome check --write .`)
- No test runner is configured — no `test` script exists.

## Env & Ports

- Env files live in `env/`: copy `env/.env.example` → `env/.env.<environment>` (`development` | `staging` | `uat` | `production`). Only the example is committed; the rest are gitignored.
- Which file loads: Vite reads `env/.env.<mode>` (`vite` dev = `development`, `vite build --mode <environment>`); server `main.ts`, `prisma.config.ts` and `prisma/seed.ts` read `env/.env.${APP_ENV:-development}`. Already-set vars (docker `env_file`) always win.
- Single source of truth for ports: `SERVER_PORT` (8000), `APP_PORT` (3000), `CHAT_WIDGET_PORT` (4000).
- Supports `${VAR}` expansion in `VITE_SERVER_URL`, `VITE_APP_URL`, `VITE_CHAT_WIDGET_SERVER_URL` (see `apps/app/vite.config.ts:8` and `apps/server/src/main.ts:11`).
- Vite `envDir` is `../../env` — env is per-environment, not per-app.
- CORS origins derived from `APP_PORT`/`CHAT_WIDGET_PORT`/`VITE_APP_URL`/`CORS_ORIGINS` in `apps/server/src/main.ts:16`.

## Docker

Each app owns its Dockerfiles: `apps/<app>/docker/Dockerfile.development` (bind-mount dev image) and `apps/<app>/docker/Dockerfile.production` (release image for staging/uat/production; `APP_ENV` build arg picks `env/.env.<APP_ENV>`). Build context is always the repo root. Compose files live in `docker/docker-compose.<environment>.yml`. Compose paths are relative to `docker/`; each file sets its own project `name:` so volumes never collide.

```sh
pnpm docker:development:up      # postgres + redis + localstack + server + app + widget
pnpm docker:development:logs
pnpm docker:development:down
pnpm docker:development:reset   # down -v + up -d (destroys DB)
pnpm docker:<staging|uat|production>:<build|up|down|logs>
```

- Server container runs `pnpm prisma:generate && pnpm prisma:deploy && pnpm dev:server`.
- `PROXY=true` in Docker: Vite proxies `/api/v1` + `/socket.io` to `http://server:${SERVER_PORT}`. Without proxy, `api-client` uses `VITE_SERVER_URL` directly.
- `DATABASE_URL` and `REDIS_HOST` are overridden inside compose to `postgres`/`redis` hostnames.

## Prisma (apps/server)

```sh
pnpm prisma:generate          # turbo --filter server
pnpm prisma:migrate           # migrate dev (interactive, needs DATABASE_URL)
pnpm prisma:deploy            # migrate deploy
pnpm prisma:seed              # tsc -p tsconfig.seed.json && node dist-seed/prisma/seed.js
pnpm prisma:reset             # migrate reset (no seed)
pnpm prisma:reset:hard        # migrate reset --force && seed
pnpm prisma:studio
pnpm resource                 # nest generate resource
```

- Schema: `apps/server/prisma/schema.prisma` — client output `src/generated/prisma` (cjs).
- `prisma:migrate` and `prisma:reset` are interactive turbo tasks; `DATABASE_URL` must be set.
- Seed compiled separately via `tsconfig.seed.json` → `dist-seed/`.

## Monorepo Layout

- `pnpm-workspace.yaml`: `apps/*`, `packages/*`
- **Apps:** `apps/app` (agent dashboard: React 19 + Vite 8 + TanStack Router + react-query + Zustand), `apps/server` (NestJS 11, commonjs), `apps/chat-widget-test` (widget harness)
- **Packages:** `chat-widget` (embeddable visitor widget), `websocket` (socket.io wrapper), `sse` (EventSource wrapper), `api-client` (typed Axios), `query` (shared react-query, `CONFIG.QUERY_KEY`), `ui`/`form`/`hooks`/`icons`/`text-editor`/`typescript-config`
- Path aliases in root `tsconfig.json` map `@package/*` → `packages/*/src/index.ts`. App resolves via `tsconfigPaths: true` in `vite.config.ts:65`.
- Turbo outputs `dist/**`; tasks cache except `dev`, `prisma:*`, `prisma:generate`.

## Tooling Quirks

- **Biome** (not ESLint/Prettier): `biome.json` — tabs, double quotes, `organizeImports` on, `useImportType: off`, `unsafeParameterDecoratorsEnabled: true` for Nest.
- **Server** is `commonjs` (`apps/server/package.json:type`), root is `module`. Don't mix import styles.
- **TanStack Router** file-based routes under `apps/app/src/routes`; plugin `autoCodeSplitting: true`.
- Guard folder misspelled: `apps/server/src/common/gaurds/` and `apps/app/src/features/auth/gaurds/`.

## Real-Time Architecture (read before touching messaging)

Dual transport, both scoped by `org:<id>` / `conversation:<id>`:

- **WS (socket.io), one namespace per gateway:** `apps/server/src/inbox/inbox.gateway.ts` (`/agent-inbox`: messaging rooms) + `apps/server/src/inbox/agent-visitors.gateway.ts` (`/agent-visitors`: agents operating on visitors) + `apps/server/src/visitor/visitor.gateway.ts` (`/visitor`: heartbeats up only) — joins on `agent:join` / `conversation:join`, emits via `EventBridge` (`apps/server/src/common/services/event-bridge.service.ts`). No Redis adapter — WS is instance-local.
- **SSE:** `apps/server/src/sse/sse.service.ts` + `sse.controller.ts` — Redis pub/sub fanout, key Set with intersection check. Agent SSE verifies `organizationMember`; WS does not (known gap).
- Messages broadcast to **both** transports; clients patch react-query caches directly (`setQueryData`/`setQueriesData`) via `applyInboxMessageEvent` (`apps/app/src/features/default-inbox/utility/inbox-cache.util.ts`) and `applyChatMessageEvent` (`packages/chat-widget/src/utility/message-cache.util.ts`) — no invalidation. Deduped by FIFO Set of message ids. Events may arrive 3× (both WS rooms + SSE).
- Cache is `AxiosResponse<ServerResponse<T>>` — patch at `previous.data.data.messages`, not `previous.data.messages`.
- Widget connects lazily (only when open + conversation exists): `packages/chat-widget/src/chat-widget.tsx`, `provider/websocket-provider.tsx`.

See `ARCHITECTURE.md` for full lifecycle and known gaps.

## Conventions

- Features under `apps/app/src/features/<name>/{providers,hooks,components,schemas}`; pages in `src/pages`.
- Server: Nest module per domain (`message/`, `conversation/`, `sse/`, `auth/`, `organization/`, `inbox/`, `visitor/`, etc.) with controller/service/dto.
- JWT strategy reads Bearer header **or** `access` cookie (needed for SSE `EventSource`): `apps/server/src/auth/strategies/jwt.strategy.ts`.
- Global prefix `/api/v1`, Swagger at `/api/v1/docs`.
