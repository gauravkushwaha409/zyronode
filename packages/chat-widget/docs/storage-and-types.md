# Storage, Types, Utilities, Config

## `lib/storage.ts`

- `CONVERSATION_KEY = "chat-widget-conversation-id"`
- `keyForOrg(orgId)` → namespaced `chat-widget-conversation-id:${orgId}`
- `getConversationId(orgId?)` checks namespaced then global (backward compat)
- `setConversationId(id, orgId?)` writes both namespaced + global
- `removeConversationId(orgId?)` clears both / all if no orgId

Why namespaced: visitor may chat on multiple orgs on same domain; global key would reuse wrong conversation.

Try/catch wraps `localStorage` for SSR / private mode.

## `types/`

- `conversation.types.ts` — `CreateConversationPayload`, `ConversationData`, `CreateConversationAxiosResponse`
- `message.types.ts` — `ChatMessage`, `SendMessagePayload`, `MessagesData`, `GetMessagesAxiosResponse`, `SendMessageAxiosResponse`
- `chat-widget-tabs.types.ts` — `ChatWidgetTab = "chat"`
- `index.ts` — re-exports + `ApiResponse` wrappers

## `utility/message-cache.util.ts`

```ts
applyChatMessageEvent(queryClient, conversationId, event: {conversation:{id}, message:ChatMessage})
```
- Guards `event.conversation.id !== conversationId`
- `setQueryData(WIDGET_QUERY_KEYS.MESSAGES, prev => append if not duplicate)`
- Preserves `ApiResponse` shape

Used by `useSendMessageMutation` onSuccess and `useOnMessageNew` (SSE/WS).

## `hooks/query-keys.ts`

```ts
WIDGET_QUERY_KEYS = {
  CONVERSATION: ["widget","conversation"],
  MESSAGES: (id) => ["widget", id, "messages"],
}
```

## `hooks/events`

- `sse/use-on-message-new.sse.ts` + `ws/use-on-message-new.ws.ts` → aggregated in `hooks/events/index.ts` `useOnMessageNew`
- `use-typing-indicator.ts` → `startTyping/stopTyping/isAgentTyping` (emits via WS `ws/use-emit-typing-*.ws.ts`, listens via `ws/use-on-typing-update.ws.ts`)
- Event types `hooks/events/event-types.ts`

## `config/`

- `api.config.ts` — endpoint constants
- `widget-config.ts` — `configureChatWidget`/`getConfig` singleton (throws if not configured)
- `tab.config.ts` — `CHAT_WIDGET_TABS` (future tabs)
- `index.ts` re-exports

## `vite-env.d.ts`

Ambient TS for `import.meta` widget env.

## `index.ts`

```ts
export { default as ChatWidget } from "./chat-widget";
export { configureChatWidget, getConfig } from "./config";
```

Entry for `@package/chat-widget` (package.json exports `".": "./src/index.ts"`).

## Build

- `vite` + `@package/query`, `@package/sse`, `@package/websocket` peers `react 19`.
- No separate build script; consumed via workspace imports.
- `check-types: tsc --noEmit`
