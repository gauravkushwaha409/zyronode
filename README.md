# Zyronode

A multi-tenant, real-time customer-support chat platform. A visitor opens an embeddable chat widget on an organization's website; agents in that organization's inbox dashboard reply in real time. Includes 1:1/group audio/video calls over WebRTC.

## Features

- Embeddable visitor chat widget (lazy conversation creation, real-time)
- Agent inbox dashboard with live conversations, typing indicators, presence
- Multi-tenant organization scoping with roles and permissions
- Dual real-time transport: Socket.IO (WebSocket) + SSE (Redis fanout)
- Audio/video calls (peer-to-peer mesh, configurable participant cap) with native WebRTC and coturn TURN
- Internal notes, live visitor tracking, cursor-based inbox pagination
- JWT auth (Bearer + `access` cookie for SSE/EventSource), Google OAuth, email OTP

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** React 19, Vite 8, TanStack Router, TanStack Query, Zustand
- **Backend:** NestJS 11 (CommonJS), Prisma, PostgreSQL, Redis
- **Real-time:** socket.io, Server-Sent Events, Redis pub/sub
- **Tooling:** Biome (lint + format), TypeScript

## Monorepo Layout

```
apps/
  app/               Agent dashboard (React + TanStack Router + react-query)
  server/            NestJS API (REST + WebSocket gateways + SSE)
  chat-widget-test/  Test harness page for the widget
packages/
  chat-widget/       Embeddable visitor chat widget
  call-signaling/    Shared WebRTC signaling event names/payloads
  websocket/         socket.io-client wrapper (WebSocketProvider, useChannel)
  sse/               EventSource wrapper (SseClient)
  api-client/        Typed Axios API client
  query/             Shared react-query setup (CONFIG.QUERY_KEY)
  ui/, form/, hooks/, icons/, text-editor/   Shared UI primitives
  typescript-config/ Shared tsconfig
```

## Prerequisites

- Node.js >= 18
- pnpm 12.4.2 (`corepack enable` recommended)
- PostgreSQL and Redis (or use Docker)

## Getting Started

```sh
# 1. Install dependencies
pnpm install

# 2. Create your environment file
cp env/.env.example env/.env.development
#    then fill in secrets (JWT_SECRET, OAuth, Resend, TURN, etc.)

# 3. Generate Prisma client and apply migrations
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed          # optional demo data

# 4. Run everything (app + server + chat-widget-test)
pnpm dev
```

- Agent dashboard: http://localhost:3000
- API + Swagger: http://localhost:8000/api/v1/docs
- Widget harness: http://localhost:4000

### Common Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps (turbo) |
| `pnpm dev:app` / `dev:server` / `dev:chat-widget` | Start one app |
| `pnpm build` | Build all apps/packages |
| `pnpm check-types` | Typecheck |
| `pnpm lint` / `pnpm format` / `pnpm check` | Biome lint / format / lint+fix+organize imports |
| `pnpm prisma:studio` | Open Prisma Studio |

## Environment & Ports

Env files live in `env/`: copy `env/.env.example` to `env/.env.<environment>` (`development` | `production`). Only the example is committed; the rest are gitignored.

- Vite reads `env/.env.<mode>` (dev = `development`).
- Server, Prisma and seed read `env/.env.${APP_ENV:-development}`.
- Ports are driven by `SERVER_PORT` (8000), `APP_PORT` (3000), `CHAT_WIDGET_PORT` (4000).

## Docker

```sh
pnpm docker:development:up      # postgres + redis + localstack + server + app + widget
pnpm docker:development:logs
pnpm docker:development:down
pnpm docker:development:reset   # down -v + up -d (destroys DB)
pnpm docker:production:<build|up|down|logs>
```

With `PROXY=true`, Vite proxies `/api/v1` and `/socket.io` to the server, so the browser only talks to the app origin.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — real-time messaging, rooms, org scoping, event lifecycle, known gaps
- [`docs/calls.md`](docs/calls.md) — audio/video calling: signaling, state machine, TURN, manual tests
- [`AGENTS.md`](AGENTS.md) — contributor/agent commands, conventions, and tooling quirks
- [`docs/`](docs) — subsystem guides; [`plans/`](plans) — historical implementation plans
