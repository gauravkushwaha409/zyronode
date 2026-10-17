# Audio/Video Calls

1:1 and group (mesh, max 4 participants) audio/video calling. Signaling runs
over Socket.IO (`/calls` namespace); media is peer-to-peer via native WebRTC
and never passes through NestJS. Event names and payloads live in
`packages/call-signaling` and are shared by server, agent dashboard, and widget.

## How it works

- **Auth**: agents connect with their JWT; visitors fetch a short-lived,
  conversation-bound token (`POST /widget/calls/token`, cookie-pinned) and
  connect with that. Identity is always derived server-side as a peer id
  (`user:<id>` / `visitor:<id>`); client `from` fields are never trusted.
- **State** (`CallsService`): `RINGING -> ACTIVE` on first non-starter join,
  `ACTIVE -> ENDED` when the last joined peer leaves, `RINGING -> ENDED
  (MISSED)` after `CALL_RING_TIMEOUT_SECONDS` (gateway timer + lazy expiry
  on every operation). One call per peer enforced with Redis `SET NX`
  markers; joins past `CALL_MAX_PARTICIPANTS` are rejected; simultaneous
  mutual invites merge deterministically into the earlier call.
- **Signaling**: the newly joined peer offers to each existing peer;
  existing peers only answer (perfect-negotiation backstop for races). ICE
  candidates arriving before the remote description are queued, then
  flushed. `webrtc:ice` is rate-limited per socket (100/10s).
- **Reconnect**: a peer with zero sockets for ~20s is dropped from the call;
  reconnecting clients re-join by persisted `callId` and rebuild the mesh.
- **ICE**: `GET /calls/ice-servers` (agents) and `GET
  /widget/calls/ice-servers` (visitors) return STUN + TURN with coturn-REST
  credentials (1h TTL). Local TURN: `coturn` service in
  `docker/docker-compose.development.yml`, config in `infra/coturn/`.
- Every ended call posts a `SYSTEM` thread message (ended + duration,
  missed, declined, cancelled, failed) and appears in `GET /calls/history`.

## Manual test

### Two agents, 1:1 video (Chrome, fake devices)

```sh
# Terminal 1: backend + coturn
pnpm docker:development:up
# Terminal 2: agent dashboard
pnpm dev:app
```

1. Open the inbox as agent A in Chrome with fake media:
   `chrome --use-fake-device-for-media-stream --use-fake-ui-for-media-stream http://localhost:3000`
2. Open an incognito/second-Chrome window as agent B on the same conversation.
3. A clicks the video-call button in the conversation header; B sees the
   incoming modal and accepts. Both should see each other (green fake-device
   video) and hear the fake tone.
4. Mute/camera toggles should reflect on the remote tile; hang up ends the
   call for both and a `SYSTEM` "Video call ended · M:SS" message appears in
   the thread, plus an entry under Details > Calls.

### Force TURN relay

In `apps/app/src/features/calls/hooks/use-call-engine.ts`, temporarily pass
`iceTransportPolicy: "relay"` in the `RTCPeerConnection` constructor, then
repeat the call above. If media still flows, the coturn service is relaying
correctly (`docker logs zyronode-coturn` shows allocations).

### Visitor widget

```sh
pnpm dev:chat-widget   # harness on :4000 (CHAT_WIDGET_PORT)
```

1. Open the widget harness, start a chat (creates the conversation).
2. Click the phone/video icon in the widget header to call an agent; accept
   from the agent dashboard incoming modal.
3. Reverse: call from the dashboard header; the widget rings even while the
   chat window state changes (provider is mounted per conversation).

### Ring timeout / busy / full

- **Timeout**: invite and never accept; after 30s (`CALL_RING_TIMEOUT_SECONDS`)
  both sides get `call:ended` with reason `MISSED` + a "Missed … call" thread
  message.
- **Busy**: while A is in a call, have C invite A; C immediately gets a busy
  failure and A is undisturbed.
- **Full**: start a call and join a 3rd and 4th peer (open more agent
  sessions); the 5th join is rejected with "Call is full".

## Limits & known gaps

- Mesh scales to ~4 by design (`CALL_MAX_PARTICIPANTS`); no SFU.
- No call recording, voicemail, or PSTN.
- The widget has no device picker or screen share (agent dashboard only).
- `webrtc:ice` rate limiting is per-instance in-memory; with many instances
  use a shared counter if abuse becomes a concern.
- `pnpm lint` has pre-existing failures in older files (e.g. the original
  `message-item` dangerouslySetInnerHTML usages); new call code is clean.
