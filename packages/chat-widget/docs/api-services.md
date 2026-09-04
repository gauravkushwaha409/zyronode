# Services & API

## `config/api.config.ts`

```ts
CHAT_WIDGET_API = {
  CONVERSATIONS: "/conversations",
  CONVERSATION_MESSAGES: (id) => `/conversations/${id}/messages`,
  CONVERSATION_VISITOR_MESSAGES: (id) => `/conversations/${id}/messages/visitor`,
}
```

Base prefix `/api/v1` added by `services/api-client.ts` `BaseAPIService` via `@package/api-client`.

## `services/api-client.ts`

```ts
getApiClient() // singleton BaseAPIService with baseURL = getConfig().serverUrl + "/api/v1"
```

Uses `@package/api-client` axios wrapper.

## `services/widget-api.service.ts`

```ts
class WidgetApiService extends BaseAPIService {
  createConversation(payload) -> POST /conversations
  getMessages(conversationId, page, limit) -> GET /conversations/:id/messages?page&limit
  sendVisitorMessage(conversationId, payload) -> POST /conversations/:id/messages/visitor
}
getWidgetApi() // singleton
```

Types in `types/conversation.types.ts` / `message.types.ts`:

- `CreateConversationPayload: { organizationId, sourceUrl?, visitorName?, visitorEmail?, channel? }`
- `ConversationData: { id, organizationId, status, channel, visitorName, ... , organization: {id,name} }`
- `SendMessagePayload: { content, messageType?, replyToId? }`
- `ChatMessage: { id, conversationId, senderType (VISITOR|AGENT|SYSTEM), messageType, content, replyTo, status, ... }`
- `MessagesData: { messages: ChatMessage[], pagination }`

## Backend mapping

`apps/server/src/conversation/conversation.controller.ts:30` `POST /conversations` (public) → `conversation.service.ts:create` (organizationId, sourceUrl, ip, userAgent). No auth.

`apps/server/src/message` (not in widget but visitor message goes there) `POST /conversations/:id/messages/visitor` (public) → creates `Message` with `senderType=VISITOR`.

## Hooks wrapping services

- `hooks/mutations/use-create-conversation.mutation.ts` → `getWidgetApi().createConversation`
- `hooks/mutations/use-send-message.mutation.ts` → `getWidgetApi().sendVisitorMessage` (dynamic id, see lazy doc)
- `hooks/queries/use-get-messages.query.ts` → `getWidgetApi().getMessages`, key `WIDGET_QUERY_KEYS.MESSAGES(conversationId)`, `enabled: !!conversationId`

## Errors

All `ApiResponse` / `APIError` from `@package/api-client`. On failure `ensureConversation` logs and throws, `ChatWidgetChat` shows console error (TODO: toast).

## Config

`config/widget-config.ts:configureChatWidget({serverUrl, websocketUrl, organizationId})` must be called before any hook; `getConfig()` throws otherwise.
