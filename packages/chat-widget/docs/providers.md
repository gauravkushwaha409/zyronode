# Providers

All in `src/provider/`.

## `conversation-provider.tsx`
- Restores/creates `conversationId` (see `conversation-lazy-creation.md`).
- Exports `useConversation()`.

## `query-provider.tsx`
```ts
const queryClient = createQueryClient(); // @package/query
<TanstackQueryProvider client={queryClient}>{children}</>
```
Single shared client for widget (not app's client). Must wrap `ConversationProvider`.

## `sse-provider.tsx`
- Reads `conversationId` + `getConfig().serverUrl`
- If `!conversationId` → renders children without SSE (no connection)
- Else mounts `@package/sse` `SseProvider` with:
  ```
  url: ${serverUrl}/api/v1/sse-event/conversation/${conversationId}
  withCredentials:false, retry 2000, max 10
  ```
- Used for `message.created` and other SSE events.

## `websocket-provider.tsx`
- Same guard `!conversationId`
- Else mounts `@package/websocket` `WebSocketProvider` with:
  ```
  url: config.websocketUrl (usually same as serverUrl)
  transports: ["websocket"], reconnection true, 10 attempts
  auth: { conversationId }
  ```
- Used for typing indicators + room joins.

## `index.ts`
Re-exports all providers.

## Ordering in `chat-widget.tsx`

```
<WidgetQueryProvider>
  <ConversationProvider>
    {isOpen && <WidgetSseProvider><WidgetWebSocketProvider><WidgetWindow/></WidgetWebSocketProvider></WidgetSseProvider>}
  </ConversationProvider>
</WidgetQueryProvider>
```

SSE/WS only mount while widget open (lazy). If conversationId gets created inside open window, providers re-render and will connect on next effect (since they check conversationId each render).

## widget-toggle / widget-header

- `widget-toggle` (features/widget-toggle): floating button, toggles `isWidgetOpen` local state in chat-widget.tsx
- `widget-header`: title + close button, calls `onClose`

## store `store/chat-widget.store.ts`

Zustand: `activeTab` ("chat"), `isOpen` (not used in widget root, root uses local state). Kept for tab switching (future).

## Chat Widget Root `chat-widget.tsx:42`

- No longer blocks on `conversationId`. Always shows `ChatWidgetChat` (handles empty).
