# Codebase Guide

Multi-tenant customer-support chat platform: a visitor opens a chat widget on an org's website, agents in that org's inbox dashboard reply in real time.

## Monorepo Layout

pnpm + turbo monorepo.

```
apps/
  app/               Agent dashboard (React + TanStack Router + react-query)
  server/            NestJS API (REST + WebSocket gateway + SSE)
  chat-widget-test/  Test harness page for the widget
packages/
  chat-widget/       Embeddable visitor chat widget (published to customer sites)
  websocket/         Shared socket.io-client wrapper (WebSocketProvider, useChannel, useEvent)
  sse/               Shared EventSource wrapper (SseClient)
  api-client/        Typed API client used by app/widget
  query/             Shared react-query setup (CONFIG.QUERY_KEY lives here)
  ui/, form/, hooks/, icons/, text-editor/   Shared UI primitives
```

## The Core Question: Real-Time Rooms & Organization Scoping

There are **two parallel transports**, both scoped by string keys:

| | WebSocket (socket.io) | SSE |
|---|---|---|
| Key format | socket.io room `org:<id>` / `conversation:<id>` | key Set entries `org:<id>` / `conversation:<id>` |
| Join point (agent) | `useChannel("agent:join", { organizationId })` | GET `/api/v1/sse-event/agent?organizationId=...` |
| Join point (visitor) | `useChannel("conversation:join", { conversationId })` | GET `/api/v1/sse-event/conversation/:conversationId` |
| Membership verified? | ❌ trusts client-sent org id | ✅ checks `organizationMember` table |
| Horizontal scaling | instance-local (no Redis adapter) | Redis pub/sub fanout |

### Lifecycle of an org-scoped event (e.g. new message)

1. **Auth at WS handshake** — `apps/server/src/chat/chat.gateway.ts:60-83`
   Dashboard connects with `auth={{ token }}` (JWT from localStorage). Gateway verifies token → `client.data.user = { id, type: "AGENT" }`. Invalid/no token → VISITOR. **No org resolution here.**

2. **Client subscribes to its org room** — `apps/app/src/features/default-inbox/providers/inbox-socket-provider.tsx:25`
   ```ts
   useChannel("agent:join", { organizationId });
   ```
   `useChannel` (`packages/websocket/src/react/use-channel.ts`) just emits once connected. `organizationId` comes from the URL param `_organization-protected/$organization/inbox.tsx`.

3. **Server joins the socket into the room** — `chat.gateway.ts:103-120`
   ```ts
   @SubscribeMessage("agent:join")
   handleAgentJoin(client, data) { client.join(`org:${data.organizationId}`); }
   ```
   socket.io creates the room implicitly on first `.join()`. Same pattern for visitors: `conversation:join` → `conversation:<id>` room (`chat.gateway.ts:89-101`).

4. **Something happens** (REST POST or WS `message:send`).

5. **Server derives org from the database** — never from client input:
   `apps/server/src/message/message.controller.ts:28-36` looks up `conversation.organizationId`.

6. **Fanout to both transports**:
   - WS: `EventBridge.emitToConversation()` + `emitToOrg()` (`apps/server/src/common/services/event-bridge.service.ts`) → `server.to(room).emit("message:new", ...)`. EventBridge is set up in gateway `afterInit` so plain HTTP controllers can emit into WS rooms.
   - SSE: `SseService.publish(["org:<id>", "conversation:<id>"], "message.created", ...)` (`apps/server/src/sse/sse.service.ts`) — matches any connected client whose key Set intersects; Redis-published to other instances.

7. **Client reacts by patching the react-query cache directly** (no refetch):
   - Dashboard: `applyInboxMessageEvent()` (`apps/app/src/features/default-inbox/utility/inbox-cache.util.ts`) is called from three places that all deliver the same message — org-room WS (`inbox-socket-provider.tsx`), SSE `message.created` (`features/sse/hooks/use-inbox-sse-events.ts`), and the send-mutation HTTP response (`use-send-agent-message.mutation.ts`). It appends to the open conversation's detail cache and patches every conversations-list cache (prefix match via `setQueriesData`): updates `lastMessage`/`lastMessageAt`, bumps `unreadCount` for visitor messages (skipped while the conversation is open), moves the conversation to top.
   - Widget: `applyChatMessageEvent()` (`packages/chat-widget/src/utility/message-cache.util.ts`) — same pattern for its messages cache, wired into WS `message:new` (`chat-widget-chat.tsx`) and the visitor send mutation.
   - Dedupe: a message can arrive up to 3× (agent sockets sit in BOTH `conversation:` and `org:` rooms and the server emits to both; SSE duplicates again; own sends overlap with broadcast). List unreadCount uses an in-module FIFO Set of recent message ids; message arrays dedupe by id inside the updater.
   - Server ordering guarantee: REST handlers always persist first (`messageService.create`) and only then broadcast, so event payloads contain the stored row (id, timestamps).

### Where each piece lives

| Concern | File |
|---|---|
| WS gateway (all handlers: join/send/typing/status) | `apps/server/src/chat/chat.gateway.ts` |
| HTTP→WS bridge for controllers | `apps/server/src/common/services/event-bridge.service.ts` |
| SSE registry + Redis fanout | `apps/server/src/sse/sse.service.ts` |
| SSE endpoints (agent w/ membership check, visitor) | `apps/server/src/sse/sse.controller.ts` |
| Message REST controller (dual broadcast) | `apps/server/src/message/message.controller.ts` |
| Dashboard WS provider + subscriptions | `apps/app/src/features/default-inbox/providers/inbox-socket-provider.tsx` |
| Dashboard SSE provider | `apps/app/src/features/sse/providers/inbox-sse-provider.tsx` |
| Conversation-level WS subscription | `apps/app/src/features/default-inbox/hooks/use-conversation-socket-events.tsx` |
| Widget composition root (lazy connect while open) | `packages/chat-widget/src/chat-widget.tsx` |
| Widget providers (connects only when conversation exists) | `packages/chat-widget/src/provider/websocket-provider.tsx`, `sse-provider.tsx` |
| socket.io wrapper | `packages/websocket/src/websocket-client.ts` + `react/use-channel.ts` |
| Cache patching (dashboard, event→cache) | `apps/app/src/features/default-inbox/utility/inbox-cache.util.ts` |
| Cache patching (widget) | `packages/chat-widget/src/utility/message-cache.util.ts` |
| Widget WS subscription + handler | `packages/chat-widget/src/hooks/events/ws/use-on-message-new.ws.ts`, `features/chat/components/chat-widget-chat.tsx` |
| Route guard requiring auth + selected org | `apps/app/src/routes/_organization-protected.tsx` |

## Authentication

- REST/SSE: Passport JWT strategy (`apps/server/src/auth/strategies/jwt.strategy.ts`) reads Bearer header **or `access` cookie** (cookie matters for SSE — EventSource can't set headers). Guard: `common/gaurds/jwt-auth.guard.ts` (note misspelling "gaurds"). Payload reduced to `{ id }`; current user injected via `@CurrentUser("id")`.
- WebSocket: manual verify in `handleConnection` from `handshake.auth.token`.
- Org membership model: Prisma `OrganizationMember` junction (`@@unique([userId, organizationId])`) in `apps/server/prisma/schema.prisma`; `User.lastOrgId` tracks active org. Frontend `_organization-protected.tsx` redirects unauthenticated/un-onboarded users before any org-scoped page mounts.
- Visitors have no account: widget creates a conversation via public endpoints; all visitor access is scoped to a single `conversation:<id>` key.

## Conventions

- Package manager pnpm; builds via turbo; lint/format Biome (`biome.json`); tabs indentation.
- TanStack Router file-based routes under `apps/app/src/routes`; pages in `src/pages`; features in `src/features/<name>` with `providers/`, `hooks/`, `components/`, `schemas/`.
- Server follows Nest module-per-domain (`message/`, `conversation/`, `sse/`, `auth/`, ...) with controller/service/dto.
- Real-time updates are applied by **patching react-query caches from event payloads** (`setQueryData`/`setQueriesData`), not invalidation — mutations also append their HTTP response directly. Refetch only for things events can't express (e.g. `conversation:updated` status changes).
- Widget connects lazily — sockets/SSE open only while widget is open AND a conversation exists.

## Gotchas / Known Gaps

1. **WS `agent:join` does not verify org membership** — any authenticated agent can join any org room. SSE path does check. Fix would mirror `sse.controller.ts:41-48` in the gateway.
2. **No Redis adapter for socket.io** — `EventBridge.emitToOrg` only reaches clients on the same server instance; SSE scales across instances via Redis. Add `@socket.io/redis-adapter` if running multiple replicas.
3. **Leave events ignored** — `useChannel` cleanup emits `{ action: "leave" }` but no handler exists server-side; sockets stay in rooms until disconnect (harmless today, memory leak-ish at scale).
4. **Widget WS auth mismatch** — widget sends `auth={{ conversationId }}` but gateway only reads `.token`, so widgets always connect as VISITOR (works because visitors use `conversation:join`, but the field is dead weight).
5. **Cache patches can drift from server truth** — list caches patched from events won't reflect server-side side effects not in the payload (e.g. a visitor message reopening a CLOSED conversation — status stays stale until next refetch). Also `unreadCount` skip-when-open is inferred from detail-cache presence, which lingers ~5 min after closing (react-query default gcTime).
6. **Widget SSE listener exists but unused** — `packages/chat-widget/src/hooks/events/sse/` defines a `message.created` handler that nothing mounts; widget realtime currently rides on WS only (SSE provider itself does connect).
7. **react-query caches the full AxiosResponse** — cached data is `AxiosResponse<ServerResponse<T>>`, so patch updaters must reach the payload at `previous.data.data` (e.g. `previous.data.data.messages`), not `previous.data.messages`. The `*Response` interfaces in `inbox-api.types.ts` are only the `{message, data}` `ServerResponse` layer, not what `setQueryData` receives; patching at the wrong depth throws and silently aborts the update. Type updaters as `ApiResponse<T>` and go one level deeper.
