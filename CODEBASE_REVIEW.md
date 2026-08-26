# Zyro-Chat Codebase Review

## Overview

A **multi-tenant, real-time customer-support chat platform** built as a **pnpm + Turborepo monorepo**. A visitor opens an embeddable chat widget on an organization's website; agents in that organization's inbox dashboard reply in real time.

---

## Project Structure

```
zyro-chat/
├── apps/
│   ├── app/                  # Agent dashboard (React 19 + Vite 8 + TanStack Router)
│   ├── server/               # NestJS API backend
│   └── chat-widget-test/     # Test harness for the chat widget
├── packages/
│   ├── api-client/           # Typed Axios API client (BaseAPIService)
│   ├── websocket/            # Socket.io wrapper (WebSocketProvider, useChannel, useEvent)
│   ├── sse/                  # EventSource wrapper (SseClient, SseProvider)
│   ├── query/                # Shared TanStack React Query with persistence
│   ├── chat-widget/          # Embeddable visitor-facing chat widget
│   ├── ui/                   # Shared UI primitives (shadcn-based)
│   ├── form/                 # Form components
│   ├── hooks/                # Shared hooks (useAudioWaveform)
│   ├── icons/                # Icon library
│   ├── text-editor/          # Rich text editor (Lexical-based)
│   └── typescript-config/    # Shared tsconfig base configs
├── docker-compose.dev.yml    # Dev Docker setup (postgres, redis, server, app)
├── turbo.json                # Turborepo task config
├── biome.json                # Linter/formatter (tabs, double quotes)
└── .env                      # Environment variables
```

---

## Backend (NestJS Server)

**Port:** 8000 | **Prefix:** `/api/v1`

### Modules

| Module | Purpose |
|--------|---------|
| `AuthModule` | Registration, login (bcrypt + Turnstile CAPTCHA), Google OAuth, JWT (access + refresh cookies), email verification (OTP via Resend), password reset |
| `PrismaModule` | Global PrismaClient with `PrismaPg` adapter |
| `RedisModule` | Global ioredis client (Redis 7) |
| `OrganizationModule` | Create org, list user's orgs |
| `ConversationModule` | Create conversation (public), find by ID/org, update status |
| `MessageModule` | Send message (agent/visitor), paginated fetch, mark read |
| `ChatModule` | Socket.io gateway — room-based events, typing indicators |
| `SseModule` | Server-Sent Events with Redis pub/sub for cross-instance fanout |
| `InboxModule` | Inbox listing with unread counts, close/reopen conversations |
| `OtpModule` | OTP generation, verification, email sending via Resend |

### Key Server Files

| File | Path |
|------|------|
| Entry | `apps/server/src/main.ts` |
| Root module | `apps/server/src/app.module.ts` |
| Prisma schema | `apps/server/prisma/schema.prisma` |
| WebSocket gateway | `apps/server/src/chat/chat.gateway.ts` |
| SSE service | `apps/server/src/sse/sse.service.ts` |
| EventBridge (HTTP→WS) | `apps/server/src/common/services/event-bridge.service.ts` |
| JWT strategy | `apps/server/src/auth/strategies/jwt.strategy.ts` |
| Auth guards | `apps/server/src/common/gaurds/` |
| Exception filter | `apps/server/src/common/filters/http-exception.filter.ts` |
| Response interceptor | `apps/server/src/common/interceptor/response.interceptor.ts` |

### Database Models

| Model | Description |
|-------|-------------|
| `User` | Auth (email/password, Google OAuth), email verification, onboarding state |
| `Organization` | Multi-tenant org with plan (FREE/STARTER/PRO/ENTERPRISE) |
| `OrganizationMember` | Junction table — user ↔ organization |
| `Visitor` | Website visitor with UTM tracking |
| `Conversation` | Chat session (status: ACTIVE/IDLE/CLOSED/PENDING, channel, metadata) |
| `Message` | Chat message (senderType: VISITOR/AGENT/SYSTEM, type: TEXT/FILE/INTERNAL_NOTE, reply support) |

---

## Frontend (React Agent Dashboard)

**Port:** 3000 | **Routing:** TanStack Router (file-based, auto code-splitting)

### Tech Stack

- React 19, Vite 8, TypeScript 6, Tailwind CSS 4
- TanStack React Query (with persistence) + Zustand (UI state)
- Zod schemas + `@package/form`
- Socket.io + SSE for real-time

### Route Structure

| Route | Purpose |
|-------|---------|
| `/` | Smart redirect based on auth state |
| `/auth/login` | Login page |
| `/auth/register` | Registration page |
| `/auth/forgot-password` | Password reset |
| `/verify/email` | Email verification |
| `/onboarding/*` | User + org onboarding steps |
| `/select-organization` | Org selection |
| `/:orgId/dashboard` | Dashboard |
| `/:orgId/inbox` | **Main inbox** — 3-column layout with conversations, messages, details |
| `/:orgId/ticket` | Tickets (stub) |
| `/:orgId/visitor` | Visitors (stub) |

### Key Frontend Files

| File | Path |
|------|------|
| Entry | `apps/app/src/main.tsx` |
| Root route (auth check) | `apps/app/src/routes/__root.tsx` |
| Org-protected layout | `apps/app/src/routes/_organization-protected.tsx` |
| Inbox page | `apps/app/src/pages/_organization-protected/default-inbox/index.tsx` |
| Inbox socket provider | `apps/app/src/features/default-inbox/providers/inbox-socket-provider.tsx` |
| Inbox SSE provider | `apps/app/src/features/sse/providers/inbox-sse-provider.tsx` |
| Cache patching | `apps/app/src/features/default-inbox/utility/inbox-cache.util.ts` |
| Auth guards | `apps/app/src/features/auth/gaurds/auth.gaurd.tsx` |
| API client | `apps/app/src/lib/api-client.ts` |
| Vite config | `apps/app/vite.config.ts` |

### Inbox Architecture

The inbox page composes two real-time providers:

```
InboxSseProvider (org-scoped SSE)
  └─ InboxSocketProvider (org-scoped WebSocket)
       └─ InboxLayout (3-column)
            ├─ ConversationList
            ├─ Conversation (messages)
            └─ ConversationDetails
```

Both WebSocket and SSE deliver the same events. `applyInboxMessageEvent()` patches react-query caches directly (no refetch). A FIFO Set deduplicates messages that arrive from both transports.

---

## Chat Widget (Embeddable)

**Location:** `packages/chat-widget/`

The widget is configured via `configureChatWidget({ serverUrl, websocketUrl, organizationId })` and embedded on customer sites. It lazily connects WS/SSE only when opened. Conversations are persisted in localStorage.

Key files:
- Entry: `packages/chat-widget/src/chat-widget.tsx`
- Config: `packages/chat-widget/src/config/widget-config.ts`
- Conversation provider: `packages/chat-widget/src/provider/conversation-provider.tsx`
- API service: `packages/chat-widget/src/services/widget-api.service.ts`

---

## Docker Setup

**File:** `docker-compose.dev.yml`

| Service | Image/Build | Port | Notes |
|---------|-------------|------|-------|
| postgres | postgres:17.4 | 5432 | Persistent volume, healthcheck |
| redis | redis:7-alpine | 6379 | Persistent volume, healthcheck |
| server | `apps/server/Dockerfile.dev` | 8000 | Runs prisma:generate → prisma:deploy → dev:server |
| app | `apps/app/Dockerfile.dev` | 3000 | `PROXY=true`, `VITE_SERVER_URL=http://server:8000` |

### Proxy Toggle

The Vite config uses a single `PROXY` env var:
- `PROXY=true` — proxy enabled (Docker default, routes `/api/v1` and `/socket.io` to server)
- `PROXY` unset or `PROXY=false` — proxy disabled, `api-client.ts` uses `VITE_SERVER_URL` directly

---

## Key Flows

### Authentication
1. Register → hash password → create user → JWT cookies → send OTP email
2. Verify OTP → `user.isEmailVerified = true`
3. Login → verify Turnstile → validate credentials → JWT cookies
4. `__root.tsx` calls `GET /auth/me` → guards check auth → redirect based on state
5. Guards: `JwtAuthGuard` → `EmailVerifiedGuard` → `OnboardingGuard`

### Real-Time Messaging (Dual Transport)
1. Agent opens inbox → joins `org:<id>` room (WS) + opens SSE stream
2. Opens conversation → joins `conversation:<id>` room (WS)
3. Message sent (WS or HTTP) → persisted to DB → broadcast via WS + SSE
4. Client patches react-query cache directly (no refetch)
5. Messages can arrive up to 3 times (WS from both rooms + SSE) — deduped by FIFO Set

### Conversation Creation
1. Widget mounts → checks localStorage for existing `conversationId`
2. No existing → `POST /conversations` with `{ organizationId, sourceUrl, channel }`
3. Server creates record → returns conversation with org data
4. Widget stores `conversationId` in localStorage → opens WS/SSE

---

## Known Gaps

1. **WS `agent:join` does not verify org membership** — SSE does, WS trusts the client
2. **No Redis adapter for Socket.io** — EventBridge only reaches the same server instance
3. **Leave events emitted but not handled** server-side
4. **Widget WS auth mismatch** — sends `conversationId` as auth, gateway only reads `.token`
5. **Cache patches can drift** from server truth (e.g., reopened CLOSED conversations)
6. **Widget SSE listener exists but is unused** — widget uses WS only for realtime
7. **No seed script** — database needs manual seeding for organizations

---

## Configuration

### Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `REDIS_HOST` | Redis hostname |
| `VITE_SERVER_URL` | Frontend API origin |
| `PROXY` | Enable/disable Vite proxy (set in docker-compose) |
| `RESEND_API_KEY` | Email service |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `CLOUDFLARE_TURNSTILE_*` | CAPTCHA verification |

### Linting

Biome with tab indentation, double quotes, recommended rules. Run via `pnpm lint`.
