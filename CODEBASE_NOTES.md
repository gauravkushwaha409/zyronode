# Codebase Notes — Working Developer Guide

Quick-reference for future sessions. Builds on `ARCHITECTURE.md` and `CODEBASE_REVIEW.md`.

## Changes Made (Aug 2026)

### Lazy Conversation Creation (no more premature POST /conversations)

**Problem:** Widget called `POST /api/v1/conversations` immediately on mount (when the chat widget opened on a customer site), creating empty conversations before the visitor even typed a message.

**Solution:** Conversation is now created lazily — only when the visitor sends their first message.

**Files changed:**

| File | What changed |
|------|-------------|
| `packages/chat-widget/src/provider/conversation-provider.tsx` | Removed `useEffect` that auto-created conversation on mount. Context now exposes `organizationId`, `page`, and `setConversationId` in addition to `conversationId`. |
| `packages/chat-widget/src/chat-widget.tsx` | `WidgetWindow` no longer blocks on `conversationId`. Chat UI renders immediately without "Loading chat..." state. |
| `packages/chat-widget/src/features/chat/components/chat-widget-chat.tsx` | `handleSend` now creates conversation first (if `conversationId` is null), then sends the message. Uses `useCreateConversationMutation` + `useSendMessageMutation` in sequence. |

**Flow (before → after):**

```
BEFORE: Widget open → POST /conversations → show chat → send message
AFTER:  Widget open → show chat → send message → POST /conversations → POST /messages
```

**Returning visitors:** localStorage restoration still works — if `conversationId` exists from a prior session, messages go directly to that conversation.

**Server unchanged:** No backend modifications needed. The lazy creation uses the same existing `POST /api/v1/conversations` endpoint.

---

## Key File Quick Reference

### Chat Widget (`packages/chat-widget/`)

| File | Purpose |
|------|---------|
| `src/chat-widget.tsx` | Root component. Composes providers, toggles widget open/closed. |
| `src/provider/conversation-provider.tsx` | Holds conversation state. Restores from localStorage, exposes org/page info. |
| `src/features/chat/components/chat-widget-chat.tsx` | Message list + input. Handles lazy conversation creation + sending. |
| `src/hooks/mutations/use-create-conversation.mutation.ts` | `useCreateConversationMutation()` — calls `POST /conversations`. |
| `src/hooks/mutations/use-send-message.mutation.ts` | `useSendMessageMutation(conversationId)` — calls `POST /conversations/:id/messages/visitor`. |
| `src/services/widget-api.service.ts` | HTTP methods: `createConversation`, `getMessages`, `sendVisitorMessage`. |
| `src/lib/storage.ts` | localStorage helpers for `chat-widget-conversation-id`. |
| `src/provider/websocket-provider.tsx` | Socket.io connection (lazy — only when widget open + conversation exists). |
| `src/provider/sse-provider.tsx` | SSE connection (lazy — same as WS). |
| `src/config/widget-config.ts` | `configureChatWidget()` / `getConfig()` — `serverUrl`, `websocketUrl`, `organizationId`. |
| `src/config/api.config.ts` | API path constants (`/conversations`, `/conversations/:id/messages/visitor`). |
| `src/utility/message-cache.util.ts` | `applyChatMessageEvent()` — patches react-query cache from WS/SSE events. |

### Server (`apps/server/`)

| File | Purpose |
|------|---------|
| `src/conversation/conversation.controller.ts` | `POST /conversations` (public), `GET /conversations/:id`, `GET /conversations/org/:orgId`, `PATCH /conversations/:id/status`. |
| `src/conversation/conversation.service.ts` | Conversation CRUD. `create()` handles Prisma `P2003` (invalid org). |
| `src/message/message.controller.ts` | `POST /conversations/:id/messages` (agent, auth), `POST /conversations/:id/messages/visitor` (public), `GET /conversations/:id/messages`. |
| `src/message/message.service.ts` | `create()` — persists message, reopens CLOSED conversation if visitor sends, touches `updatedAt`. |
| `src/chat/chat.gateway.ts` | WS gateway — handles `agent:join`, `conversation:join`, `message:send`, typing indicators. |
| `src/sse/sse.service.ts` | Redis-backed SSE pub/sub with key-based routing (`org:<id>`, `conversation:<id>`). |
| `src/common/services/event-bridge.service.ts` | HTTP controllers can emit into WS rooms (`emitToOrg`, `emitToConversation`). |

### Database (Prisma schema)

- `Conversation` — `id`, `organizationId`, `visitorId?`, `status` (ACTIVE/IDLE/CLOSED/PENDING), `channel`, metadata fields
- `Message` — `id`, `conversationId`, `senderType` (VISITOR/AGENT/SYSTEM), `senderId?`, `messageType` (TEXT/FILE/INTERNAL_NOTE), `content`, `replyToId?`, `status` (SENT/DELIVERED/READ)

---

## Build & Type Check Commands

```bash
# Type check the chat-widget package
pnpm --filter @package/chat-widget run check-types

# Type check the server
pnpm --filter @package/server run check-types

# Lint (Biome)
pnpm lint
```

---

## Patterns to Remember

1. **React-query cache patching** — events patch caches directly via `setQueryData`, never invalidation. Data shape is `AxiosResponse<{ message, data: T }>`, so patch at `previous.data.data`.
2. **Dual transport dedup** — messages arrive via WS (both `conversation:` and `org:` rooms) + SSE. Dedup by message `id` in the cache updater.
3. **Widget SSE exists but unused** — `use-on-message-new.sse.ts` exists but nothing mounts it. Widget realtime rides on WS only.
4. **Public endpoints (no auth)** — Visitor conversation creation and message sending have no auth guard.
5. **Guard misspelling** — Auth guards are in `common/gaurds/` (not `guards`).
