# Spec: Inbox Conversation List — Bidirectional Cursor Pagination (Backend Only)

## 1. Goal
Replace offset pagination (`page`/`limit`/`skip`/`total`) with cursor-based keyset pagination for `GET /inbox/conversations`, supporting both directions (up = newer, down = older), backend only.

## 2. Current State
- File: `apps/server/src/inbox/inbox.controller.ts:29` `GET /inbox/conversations` with `ListInboxConversationsDto:27` fields `page?`, `limit?`
- Service: `apps/server/src/inbox/inbox.service.ts:17-97` does `skip=(page-1)*limit`, `findMany skip/take`, `count`, returns `pagination:{page,limit,total,totalPages}` ordered `updatedAt desc` (`schema.prisma:242` `@@index([organizationId, updatedAt(sort:Desc)])`).
- Issues: offset is O(n), `total` expensive, deep pages drift when `updatedAt` changes (new message bumps conversation).

## 3. Requirements
- Backend only, no frontend change required (keep `page` deprecated for backward compat).
- Support `limit` 1-100 default 20.
- Cursor opaque base64url JSON `{updatedAt: ISO, id: uuid}` tie-breaker for stable sort on `updatedAt` duplicates.
- Direction `next` (default) = older (desc), `prev` = newer (desc).
- Same filters: `organizationId` required, `status` enum, `search` (visitorName/visitorEmail contains insensitive).
- Response provides `nextCursor`, `prevCursor`, `hasNext`, `hasPrev`, `limit`, `direction`, `cursor` for infinite scroll both ways.
- Invalid cursor → 400.
- No `total`/`totalPages` in cursor mode.

## 4. API Contract
### Request DTO (new fields)
```ts
export class ListInboxConversationsDto {
  organizationId: string
  status?: "ACTIVE"|"IDLE"|"CLOSED"|"PENDING"
  search?: string
  page?: number // deprecated, use cursor
  limit?: number // default 20
  cursor?: string // base64url
  direction?: "next"|"prev" // default "next"
}
```

### Response
```ts
{
  message: "Inbox conversations fetched successfully",
  data: {
    conversations: Array<{id,status,channel,visitorName,visitorEmail,lastMessageAt,createdAt,lastMessage,unreadCount}>,
    pagination: {
      limit: number
      direction: "next"|"prev"
      cursor: string|null
      nextCursor: string|null
      prevCursor: string|null
      hasNext: boolean
      hasPrev: boolean
    } | {
      page, limit, total, totalPages // fallback offset mode when cursor absent and page used
    }
  }
}
```
First page: no `cursor`, `prevCursor=null`, `hasPrev=false`, `nextCursor` if more older.

Next page (older): `GET ...?cursor=nextCursor&direction=next` → older than cursor.

Prev page (newer): `GET ...?cursor=prevCursor&direction=prev` → newer than cursor.

## 5. Query Semantics
Order: `orderBy: [{updatedAt:"desc"}, {id:"desc"}]`

Base `where = {organizationId, ...(status&&{status}), ...(search&&{OR:[...]})}`

Cursor `where`:
- `next` (lt): `OR: [{updatedAt:{lt:cursorDate}}, {updatedAt:cursorDate, id:{lt:cursorId}}]`
- `prev` (gt): `OR: [{updatedAt:{gt:cursorDate}}, {updatedAt:cursorDate, id:{gt:cursorId}}]`

Final `where = cursor ? {AND:[baseWhere, cursorWhere]} : baseWhere`

Fetch `take: limit+1`, slice to `limit`, `hasExtra = len > limit`.

Pagination computation:
- next: `hasNext = hasExtra`, `hasPrev = !!cursor`
- prev: `hasPrev = hasExtra`, `hasNext = conversations.length>0`
- `nextCursor = hasNext || (direction==="prev" && conversations.length) ? encode(last) : null`
- `prevCursor = hasPrev || (direction==="next" && !!cursor) ? encode(first) : null` simplified to above spec.

## 6. Non-Goals
- Frontend infinite scroll implementation.
- New indexes (optional, not required as `updatedAt desc` already indexed).
- Changing `GET /inbox/conversations/:id` (detail).

## 7. Validation
- `cursor` must decode to valid ISO date + uuid, else 400.
- `direction` enum, `limit` 1-100.
- Empty result → both cursors null, hasNext/hasPrev false.

## 8. Backward Compatibility
If `cursor` absent, fallback to existing offset logic (page/limit/total) to not break existing clients. Deprecate `page` in Swagger.

## 9. Security
Same `JwtAuthGuard`, no extra.

## 10. Testing Seed
Need 30 conversations with staggered `updatedAt` (1s apart) to verify tie-breaker and both directions.
