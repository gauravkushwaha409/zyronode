# Plan: Inbox Bidirectional Cursor Pagination — Backend Only

## Overview
Implement spec `plans/2026-09-02-inbox-cursor-pagination-spec.md` for `GET /inbox/conversations`.

## Files to Change
- `apps/server/src/inbox/dto/list-inbox-conversations.dto.ts` — add `cursor`, `direction`, deprecate `page` doc, keep `limit`
- `apps/server/src/inbox/inbox.service.ts` — add `encodeCursor`/`decodeCursor`, split `getConversations` into cursor vs offset branches, implement `cursorWhere` + `AND` logic, `limit+1` fetch, `hasNext`/`hasPrev`/`nextCursor`/`prevCursor` computation
- `apps/server/src/inbox/inbox.controller.ts:29` — forward `cursor`/`direction` to service, update Swagger
- No schema migration required (uses existing `@@index([organizationId, updatedAt(sort:Desc)])`), optional composite `@@index([organizationId, updatedAt, id])` not added now

## Implementation Steps
1. **DTO** — add `@IsString() @IsOptional() cursor?`, `@IsEnum(['next','prev']) direction?` with `@ApiPropertyOptional`, mark `page` deprecated.
2. **Service helpers**
   ```ts
   encodeCursor(c: {updatedAt:Date,id:string}) => base64url(JSON)
   decodeCursor(s) => {updatedAt:Date,id} throw BadRequest if invalid
   ```
3. **Service `getConversations`**
   - Parse `limit` clamp 1-100 default 20, `direction` default "next"
   - If `cursor` present: decode, build `baseWhere` (organizationId, status, search OR), build `cursorWhere` (lt/gt per direction), final `where={AND:[baseWhere,cursorWhere]}`, `findMany` with `orderBy:[{updatedAt:"desc"},{id:"desc"}]`, `take:limit+1`, map, compute pagination cursors as spec, return cursor pagination shape
   - Else: keep existing offset `skip`, `count`, return page pagination
4. **Controller** — pass `cursor`, `direction` through.
5. **Validation** — `pnpm --filter server exec tsc --noEmit`, `prisma validate`, manual curl tests.
6. **Testing** (manual, no DB reset required):
   - Seed or create 5 conversations, note `updatedAt`
   - `curl "http://localhost:SERVER_PORT/api/v1/inbox/conversations?organizationId=X&limit=2"` → check `nextCursor`
   - `curl "...&cursor=nextCursor&direction=next"` → older
   - `curl "...&cursor=prevCursor&direction=prev"` → newer
   - Test `search` + cursor, `status` + cursor, invalid cursor → 400
   - Verify offset fallback still works: `?page=2&limit=2` without cursor

## Risks & Mitigations
- `OR` + `AND` nesting with search `OR` — use `AND: [baseWhere, cursorWhere]` to avoid overwriting, test with `search` param.
- Duplicate `updatedAt` — `id` tie-breaker ensures stable pagination.
- Empty cursor `updatedAt` invalid — `decodeCursor` validates ISO.
- No `total` in cursor mode — frontend must use `hasNext`/`hasPrev`; document in Swagger.

## Verification Checklist
- [ ] `pnpm --filter server exec tsc --noEmit` passes
- [ ] `prisma validate` passes
- [ ] `curl` next/prev both directions return correct `hasNext`/`hasPrev` and cursors decode correctly
- [ ] `search` + cursor filtered correctly
- [ ] Invalid cursor returns 400
- [ ] Old `page` pagination still works when `cursor` omitted

## Rollout
- No DB migration
- Deploy backend only, frontend can migrate incrementally to cursor
- Keep `page` deprecated for 1 release, then remove

## Follow-ups (out of scope)
- Frontend infinite scroll using `nextCursor`/`prevCursor`
- Add `@@index([organizationId, updatedAt, id])` if performance needed
- Add `GET /inbox/conversations/:id/messages` cursor pagination similarly
