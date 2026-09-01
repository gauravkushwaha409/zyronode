# Feature: `features/chat`

## Location
- `features/chat/components/chat-widget-chat.tsx` (main)
- `features/chat/index.ts` re-export

## Responsibilities
- Render message history (paginated GET)
- Send visitor messages (POST visitor message)
- Typing indicators (WS)
- Real-time updates (SSE + WS)

## Hooks Used

- `useConversation()` → `conversationId`, `ensureConversation`, `isCreating`
- `useGetMessagesQuery(conversationId)` (`hooks/queries/use-get-messages.query.ts`) → disabled when `!conversationId`
- `useSendMessageMutation()` (dynamic) → per-call `conversationId`
- `useTypingIndicator({conversationId})` (hooks/events/use-typing-indicator.ts) → `startTyping/stopTyping/isAgentTyping`
- `useOnMessageNew` (hooks/events/sse + ws) → `applyChatMessageEvent`

## UI States

- `isLoading` → "Loading messages..."
- `messages.length === 0` → "No messages yet. Start the conversation!"
- Mapped `reversed` (messages come desc, render reversed)
- `isAgentTyping` → "Agent is typing..."
- `textarea` onChange → `startTyping()`, onBlur / before send → `stopTyping()`
- Enter (no Shift) → handleSend

## Props / Config

No props; consumes context. Needs `ConversationProvider` ancestor.

## Cache

`utility/message-cache.util.ts:applyChatMessageEvent` does `setQueryData(WIDGET_QUERY_KEYS.MESSAGES)` appending message if not duplicate (`m.id` check). Keeps `ApiResponse<MessagesData>` shape.

## Edge Cases

- Lazy conversation: handleSend awaits `ensureConversation` before mutate.
- Button disabled when `!content.trim() || isSending || isCreatingConversation`.
