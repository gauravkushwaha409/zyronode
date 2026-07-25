# Server-Side Chat System Implementation Plan

## Goal
Build the server-side for real-time agent-visitor chat: session management, messages, and Socket.IO-powered delivery. Visitors chat from an embedded widget (future); agents handle conversations from the inbox UI.

## Architecture Overview

```
Visitor (widget)  ──►  Socket.IO  ──►  ChatGateway  ──►  Prisma (PostgreSQL)
                           ▲                                    │
                           │                                    ▼
Agent (inbox UI) ──►  Socket.IO  ◄──  ChatGateway  ◄──  Redis (pub/sub for multi-instance)
```

Two user types:
- **Agent**: Authenticated via JWT. Org owner or team member. Sees all sessions for their org.
- **Visitor**: Unidentified. Identified only by `session_id` stored in browser localStorage. Clearing browser data = new session.

---

## Phase 1: Prisma Schema Changes

### New Enums

```prisma
enum SessionStatus {
  ACTIVE    // visitor is online / recent activity
  IDLE      // no activity for a while
  CLOSED    // agent closed the conversation
  PENDING   // visitor is waiting for first agent reply
}

enum MessageSenderType {
  VISITOR
  AGENT
  SYSTEM
}

enum MessageType {
  TEXT
  FILE
  INTERNAL_NOTE   // agent-only, not visible to visitor
}

enum MessageDeliveryStatus {
  SENT
  DELIVERED
  READ
}
```

### New Models

```prisma
model Session {
  id             String        @id @default(cuid())
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  status         SessionStatus @default(ACTIVE)
  channel        String        @default("web")    // web, mobile, email, whatsapp
  visitorName    String?       // optional name from widget
  visitorEmail   String?       // optional email from widget
  visitorPhone   String?       // optional phone from widget
  ipAddress      String?
  userAgent      String?
  sourceUrl      String?       // page where widget was opened
  metadata       Json?         // extra visitor context (UTM, referrer, etc.)

  messages       Message[]

  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  @@index([organizationId])
  @@index([organizationId, status])
  @@index([organizationId, updatedAt(sort: Desc)])
  @@map("sessions")
}

model Message {
  id             String              @id @default(cuid())
  sessionId      String
  session        Session             @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  senderType     MessageSenderType
  senderId       String?             // agent userId if senderType=AGENT, null for VISITOR/SYSTEM
  messageType    MessageType         @default(TEXT)
  content        String              // text content or file URL

  replyToId      String?             // parent message id for threaded replies
  replyTo        Message?            @relation("MessageReplies", fields: [replyToId], references: [id])
  replies        Message[]           @relation("MessageReplies")

  status         MessageDeliveryStatus @default(SENT)
  isEdited       Boolean             @default(false)
  editedAt       DateTime?

  createdAt      DateTime            @default(now()) @map("created_at")
  updatedAt      DateTime            @updatedAt @map("updated_at")

  @@index([sessionId])
  @@index([sessionId, createdAt(sort: Desc)])
  @@index([senderId])
  @@map("messages")
}
```

### Organization model addition
Add `sessions Session[]` to the existing Organization model.

### Migration
Run `prisma migrate dev --name add-chat-system` after schema changes.

---

## Phase 2: New Modules to Create

### Module structure (under `apps/server/src/`)

```
src/
├── session/
│   ├── session.module.ts
│   ├── session.controller.ts      // REST endpoints
│   ├── session.service.ts         // business logic
│   ├── dto/
│   │   ├── create-session.dto.ts  // visitor creates session
│   │   └── list-sessions.dto.ts   // agent lists sessions (with filters)
│   └── entities/
│       └── session.entity.ts      // response types
├── message/
│   ├── message.module.ts
│   ├── message.controller.ts      // REST endpoints
│   ├── message.service.ts         // business logic
│   └── dto/
│       ├── send-message.dto.ts
│       └── list-messages.dto.ts
├── chat/
│   ├── chat.module.ts
│   ├── chat.gateway.ts            // Socket.IO gateway
│   └── chat.service.ts            // message persistence + real-time dispatch
└── inbox/
    ├── inbox.module.ts
    ├── inbox.controller.ts        // agent-side queries
    └── inbox.service.ts           // list sessions with last message, unread counts, etc.
```

---

## Phase 3: REST API Endpoints

### Visitor endpoints (no auth, session_id based)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/sessions` | Create new session (returns session_id) |
| `GET` | `/v1/sessions/:id` | Resume session (get session + recent messages) |
| `POST` | `/v1/sessions/:id/messages` | Send message (visitor → agent) |

### Agent endpoints (JWT auth required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/inbox/sessions` | List all sessions for org (with filters, search, pagination) |
| `GET` | `/v1/inbox/sessions/:id` | Get session details + messages |
| `POST` | `/v1/inbox/sessions/:id/messages` | Send message (agent → visitor) |
| `PATCH` | `/v1/inbox/sessions/:id/status` | Update session status (open/close/pending) |
| `POST` | `/v1/inbox/sessions/:id/close` | Close session |
| `POST` | `/v1/inbox/sessions/:id/reopen` | Reopen session |

---

## Phase 4: Socket.IO Gateway (Real-time)

### Install dependency
```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Events

#### Visitor → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `session:join` | `{ sessionId }` | Visitor joins session room |
| `message:send` | `{ sessionId, content, messageType?, replyToId? }` | Visitor sends message |
| `typing:start` | `{ sessionId }` | Visitor typing indicator |
| `typing:stop` | `{ sessionId }` | Visitor stops typing |

#### Agent → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `agent:join` | `{ organizationId }` | Agent joins org room |
| `session:open` | `{ sessionId }` | Agent opens a session (marks as reading) |
| `message:send` | `{ sessionId, content, messageType?, replyToId? }` | Agent sends message |
| `message:internal-note` | `{ sessionId, content }` | Agent sends internal note |
| `typing:start` | `{ sessionId }` | Agent typing indicator |
| `typing:stop` | `{ sessionId }` | Agent stops typing |

#### Server → Clients
| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ session, message }` | New message in a session |
| `message:updated` | `{ message }` | Message edited/deleted |
| `session:updated` | `{ session }` | Session status changed |
| `session:new` | `{ session }` | New session created (agent notification) |
| `typing:update` | `{ sessionId, senderType, isTyping }` | Typing indicator |

### Room structure
- **Visitor room**: `session:{sessionId}` — visitor + agents viewing that session
- **Org room**: `org:{organizationId}` — all agents in that org (for new session notifications)

### Authentication
- **Agent**: JWT token passed in handshake auth → validated via `JwtStrategy`
- **Visitor**: No auth required. Identified by sessionId.

---

## Phase 5: Implementation Order

### Step 1: Schema + Migration
1. Add `Session` and `Message` models to `schema.prisma`
2. Add new enums (`SessionStatus`, `MessageSenderType`, `MessageType`, `MessageDeliveryStatus`)
3. Add `sessions` relation to `Organization` model
4. Run `prisma migrate dev --name add-chat-system`
5. Run `prisma generate`

### Step 2: Session Module
1. Create `session/` directory structure
2. `CreateSessionDto` — `organizationId`, `sourceUrl?`, `visitorName?`, `visitorEmail?`, `metadata?`
3. `SessionService.create()` — create session, return session_id
4. `SessionService.findById()` — get session + last 50 messages
5. `SessionController` — POST `/v1/sessions`, GET `/v1/sessions/:id`

### Step 3: Message Module
1. Create `message/` directory structure
2. `SendMessageDto` — `content`, `messageType?`, `replyToId?`
3. `MessageService.create()` — persist message, update session `updatedAt`
4. `MessageService.findBySession()` — paginated messages for a session
5. `MessageController` — POST `/v1/sessions/:id/messages`, GET `/v1/sessions/:id/messages`

### Step 4: Chat Gateway (Socket.IO)
1. Install `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
2. Create `ChatGateway` with `@WebSocketGateway()`
3. Handle visitor connections (session-based rooms)
4. Handle agent connections (org-based rooms, JWT auth)
5. Wire `message:send` → persist + broadcast to room
6. Handle typing indicators (broadcast, no persistence)
7. Create `ChatModule` importing `SessionModule`, `MessageModule`

### Step 5: Inbox Module (Agent-side queries)
1. `InboxService.getSessions(orgId)` — list sessions with:
   - Last message snippet
   - Unread count (messages after agent's last viewed timestamp)
   - Visitor info
   - Status, priority, timestamps
2. `InboxService.getSessionDetails(orgId, sessionId)` — full session with all messages
3. `InboxController` — GET `/v1/inbox/sessions`, GET `/v1/inbox/sessions/:id`
4. PATCH `/v1/inbox/sessions/:id/status` — update status
5. POST `/v1/inbox/sessions/:id/close` — close session
6. POST `/v1/inbox/sessions/:id/reopen` — reopen session

### Step 6: Wire into AppModule
1. Add `SessionModule`, `MessageModule`, `ChatModule`, `InboxModule` to `AppModule` imports
2. Update `main.ts` CORS config to support Socket.IO origins
3. Update `main.ts` to initialize Socket.IO adapter

### Step 7: Frontend Integration
1. Update `apps/app/src/features/default-inbox/services/` to call real API endpoints
2. Add Socket.IO client to frontend (`socket.io-client`)
3. Wire inbox components to real-time events
4. Replace mock data with live data

---

## Key Design Decisions

1. **Session = conversation unit**: One session = one chat thread. Visitor gets a `session_id` stored in localStorage. Clearing browser = new session.

2. **No visitor auth**: Visitors are identified only by their session_id. No JWT, no login. The session itself is the identity.

3. **All org members see all sessions**: No per-agent assignment needed initially. Any agent can respond to any session.

4. **Internal notes**: Messages with `messageType: INTERNAL_NOTE` are only visible to agents, never to visitors.

5. **Threaded replies**: Messages can reply to other messages via `replyToId` field.

6. **Unread tracking**: Each session tracks when an agent last viewed it. Unread count = messages after that timestamp.

7. **Redis for multi-instance**: Use Redis adapter for Socket.IO to support horizontal scaling (multiple server instances).

8. **Session lifecycle**: ACTIVE → IDLE (after inactivity) → CLOSED (agent action). Visitors can reopen by sending a new message if session is CLOSED.

---

## Files to Create/Modify

### New files (~20 files)
- `apps/server/prisma/schema.prisma` (modify — add models)
- `apps/server/src/session/session.module.ts`
- `apps/server/src/session/session.controller.ts`
- `apps/server/src/session/session.service.ts`
- `apps/server/src/session/dto/create-session.dto.ts`
- `apps/server/src/session/dto/list-sessions.dto.ts`
- `apps/server/src/message/message.module.ts`
- `apps/server/src/message/message.controller.ts`
- `apps/server/src/message/message.service.ts`
- `apps/server/src/message/dto/send-message.dto.ts`
- `apps/server/src/message/dto/list-messages.dto.ts`
- `apps/server/src/chat/chat.module.ts`
- `apps/server/src/chat/chat.gateway.ts`
- `apps/server/src/chat/chat.service.ts`
- `apps/server/src/inbox/inbox.module.ts`
- `apps/server/src/inbox/inbox.controller.ts`
- `apps/server/src/inbox/inbox.service.ts`

### Modified files
- `apps/server/src/app.module.ts` — add new module imports
- `apps/server/src/main.ts` — update CORS for Socket.IO
- `apps/server/prisma/schema.prisma` — add Session, Message models + enums
- `apps/server/package.json` — add socket.io dependencies

---

## Verification
1. Run `prisma migrate dev` — migration succeeds
2. Run `pnpm run dev` on server — starts without errors
3. Test session creation via curl/Postman
4. Test message sending via Socket.IO client
5. Verify agent receives messages in real-time
6. Verify inbox list shows sessions with last message
