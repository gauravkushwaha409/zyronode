# @package/chat-widget

Embeddable visitor chat widget. Lives in `packages/chat-widget/src`. Used by `apps/chat-widget-test` (dev harness) and any external site that includes the widget script.

## Quick Start

```ts
import { ChatWidget, configureChatWidget } from "@package/chat-widget";

configureChatWidget({
  serverUrl: "http://localhost:8000",      // api origin (VITE_CHAT_WIDGET_SERVER_URL or SERVER_PORT)
  websocketUrl: "http://localhost:8000",   // socket.io origin
  organizationId: "f95d4ede-71a0-46c9-a3d2-d1f56609cd01",
});

<ChatWidget organizationId={orgId} page={window.location.href} />
```

`chat-widget.tsx:18` renders toggle + lazily-mounted window inside `ConversationProvider` + `WidgetQueryProvider` + `Sse/WebSocket` providers.

## Architecture

```
ChatWidget (chat-widget.tsx)
├─ WidgetQueryProvider (tanstack query)
├─ ConversationProvider (localStorage + lazy POST /conversations)
├─ WidgetToggle (features/widget-toggle)
├─ WidgetWindow (conditional on isOpen)
│  ├─ WidgetHeader
│  ├─ ChatWidgetChat (features/chat)
│  └─ providers/sse + websocket (activated only after conversationId exists)
```

## Key Decisions

- **Lazy conversation**: `conversation-provider.tsx` does NOT `POST /conversations` on open. See `docs/conversation-lazy-creation.md`.
- **Storage namespaced per org**: `lib/storage.ts` keys `chat-widget-conversation-id:${orgId}` (fallback global).
- **Message cache**: `utility/message-cache.util.ts:applyChatMessageEvent` merges incoming SSE/WS events into `WIDGET_QUERY_KEYS.MESSAGES`.
- **Docs per feature**: this folder.

## Backend Contract

Base `serverUrl` from `widget-config.ts:getConfig()`. Endpoints in `config/api.config.ts`:

- `POST /conversations` body `CreateConversationPayload` (orgId, sourceUrl, channel="web") → `ConversationData`
- `GET /conversations/:id/messages?page&limit` → `MessagesData`
- `POST /conversations/:id/messages/visitor` body `SendMessagePayload` → `ChatMessage`

All under `/api/v1` (see `apps/server/src/conversation/conversation.controller.ts:30` no auth for visitors, `apps/server/src/message` for visitor messages).

## Edge Cases

- No orgId → `ensureConversation` throws.
- `localStorage` blocked → in-memory fallback (null).
- Concurrent sends → single in-flight `createConversation` promise (deduped via `pendingRef`).
- Widget opened many times with no message → zero conversations created (previous bug).
