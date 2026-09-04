# Lazy Conversation Creation

**Problem:** `ConversationProvider` `useEffect` on mount auto-called `POST http://localhost:SERVER_PORT/api/v1/conversations` (`/api/v1` + `CHAT_WIDGET_API.CONVERSATIONS` in `config/api.config.ts:2`) restoring empty conversations for every widget open. Visitors who just opened and closed the widget created DB rows.

**Goal:** Create conversation **only when visitor sends first message**. Reuse `conversationId` from `localStorage` if present.

## Flow

```
visitor opens widget
  → ConversationProvider reads localStorage `chat-widget-conversation-id:${orgId}` (lib/storage.ts)
  → NO network call, render ChatWidgetChat with empty messages
  → SSE/WS providers render children unconnected (sse-provider.tsx:15, websocket-provider.tsx:15)

visitor types + hits Send
  → ChatWidgetChat.handleSend() (features/chat/components/chat-widget-chat.tsx:39)
  → calls useConversation().ensureConversation()
      → checks localStorage again
      → if id exists → return id
      → if pending promise exists → return same promise (dedupes spam)
      → else POST /conversations { organizationId, sourceUrl, channel:"web" } via getWidgetApi().createConversation()
      → on success: setConversationId(id, orgId) (namespaced key + global fallback), setConversationIdState(id)
  → with activeId, calls useSendMessageMutation().mutate({ conversationId: activeId, payload: {content, messageType:"TEXT"} })
      → POST /conversations/:id/messages/visitor (config/api.config.ts:5)
      → onSuccess: applyChatMessageEvent() merges into query cache

Next open / reload
  → provider restores id from storage, no new POST, history loads via useGetMessagesQuery
```

## Code

### Provider `provider/conversation-provider.tsx`

- State: `conversationId` from `getConversationId(orgId)` lazy init
- `useEffect` on `orgId` change re-hydrates `conversationId`
- `isCreating` + `pendingRef` dedupes
- Context: `{ conversationId, isCreating, ensureConversation }`

Before (bug):
```ts
useEffect(() => { if (!conversationId) createConversation({organizationId: orgId, sourceUrl, channel:"web"}) }, [conversationId])
```

After:
```ts
const ensureConversation = useCallback(async () => {
  const stored = getConversationId(orgId); if (stored) return stored;
  if (pendingRef.current) return pendingRef.current;
  return getWidgetApi().createConversation({organizationId: orgId, sourceUrl, channel:"web"})
    .then(res => { const id = res.data.data.id; setConversationId(id, orgId); return id; })
}, [orgId, page])
```

### Chat `features/chat/components/chat-widget-chat.tsx`

```ts
const { conversationId, ensureConversation, isCreating } = useConversation();
const { mutate: sendMessage } = useSendMessageMutation(); // now takes {conversationId,payload}

const handleSend = async () => {
  let activeId = conversationId;
  if (!activeId) activeId = await ensureConversation();
  sendMessage({ conversationId: activeId, payload: { content, messageType:"TEXT" } })
}
```

### Wrapper `chat-widget.tsx:42`

Removed blocking `if (!conversationId) return Loading...`. Now always renders `ChatWidgetChat` (empty state handled inside chat).

## Storage `lib/storage.ts`

- `CONVERSATION_KEY = "chat-widget-conversation-id"`
- `keyForOrg(orgId)` → `chat-widget-conversation-id:${orgId}` if orgId else global
- `get` checks namespaced then global
- `set` writes both namespaced + global (backward compat)
- `remove` clears both

## Mutation `hooks/mutations/use-send-message.mutation.ts`

Now hybrid:
- New lazy: `mutate({ conversationId, payload })`
- Legacy: `useSendMessageMutation(capturedId)` + `mutate(payload)` still works (detects `conversationId in variables`)

OnSuccess uses per-call `cid` to `applyChatMessageEvent(queryClient, cid, ...)`

## Verification

1. Clear `localStorage`
2. Open widget → Network tab: no `POST /conversations`
3. Type message + Send → first request is `POST /conversations`, second is `POST /conversations/:id/messages/visitor`
4. Reload page → no new conversation, `GET /conversations/:id/messages` loads history
5. With existing id → Send goes directly to messages endpoint
6. Check provider `pendingRef` prevents double create on double-click

## Future

- If visitor switches organization, storage namespace prevents cross-org reuse.
- Could add TTL: if conversation `status === CLOSED`, clear storage and create new on next message.
