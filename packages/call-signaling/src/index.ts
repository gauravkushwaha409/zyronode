/**
 * Single source of truth for audio/video call signaling.
 *
 * Transport: Socket.IO namespace `/calls` only. Media (RTP) is peer-to-peer
 * via the browser's native WebRTC APIs and never passes through the server.
 * The server only relays signaling, enforces call state, and issues TURN
 * credentials.
 *
 * Both `apps/server` and the clients (`apps/app`, `packages/chat-widget`)
 * must import event names and payloads from here — never hardcode strings.
 */

/** Socket.IO namespace served by CallsGateway. */
export const CALLS_NAMESPACE = "/calls";

/** Room holding every socket of one user (all devices). */
export function userRoom(userId: string): string {
	return `user:${userId}`;
}

/** Room holding every socket of one visitor (all tabs). */
export function visitorRoom(visitorId: string): string {
	return `visitor:${visitorId}`;
}

/** Room holding every socket currently in one call. */
export function callRoom(callId: string): string {
	return `call:${callId}`;
}

/**
 * Unified participant identity on the wire. Agents are `user:<userId>`,
 * visitors are `visitor:<visitorId>`. Rooms are exactly these strings.
 */
export type PeerId = `user:${string}` | `visitor:${string}`;

export function peerIdForUser(userId: string): PeerId {
	return `user:${userId}`;
}

export function peerIdForVisitor(visitorId: string): PeerId {
	return `visitor:${visitorId}`;
}

export function roomForPeer(peerId: string): string {
	return peerId;
}

export function parsePeerId(peerId: string): { kind: "user" | "visitor"; id: string } | null {
	const match = /^(user|visitor):(.+)$/.exec(peerId);
	if (!match) return null;
	return { kind: match[1] as "user" | "visitor", id: match[2] as string };
}

export type CallType = "AUDIO" | "VIDEO";

export type CallStatus = "RINGING" | "ACTIVE" | "ENDED";

export type CallEndReason =
	| "COMPLETED"
	| "MISSED"
	| "REJECTED"
	| "CANCELLED"
	| "FAILED";

export type CallParticipantStatus =
	| "INVITED"
	| "JOINED"
	| "LEFT"
	| "REJECTED"
	| "MISSED";

/** Plain-data SDP payload (maps to RTCSessionDescriptionInit on the client). */
export interface SdpPayload {
	type: "offer" | "answer";
	sdp: string;
}

/** Plain-data ICE candidate (maps to RTCIceCandidateInit on the client). */
export interface IceCandidatePayload {
	candidate: string;
	sdpMid: string | null;
	sdpMLineIndex: number | null;
}

/** A peer already in the call, sent as the join reply. */
export interface CallPeerInfo {
	peerId: PeerId;
	audio: boolean;
	video: boolean;
}

// ─── Client -> server ───────────────────────────────────────────────

export const ClientCallEvents = {
	INVITE: "call:invite",
	JOIN: "call:join",
	REJECT: "call:reject",
	LEAVE: "call:leave",
	OFFER: "webrtc:offer",
	ANSWER: "webrtc:answer",
	ICE: "webrtc:ice",
	MEDIA_STATE: "call:media-state",
} as const;

export type ClientCallEvent =
	(typeof ClientCallEvents)[keyof typeof ClientCallEvents];

export interface CallInvitePayload {
	conversationId: string;
	type: CallType;
	/**
	 * Peer ids to ring. Empty = ring every other member of the conversation.
	 * Agents pass user ids or full peer ids; each is normalized server-side.
	 */
	inviteeIds?: string[];
}

export interface CallJoinPayload {
	callId: string;
}

export interface CallRejectPayload {
	callId: string;
}

export interface CallLeavePayload {
	callId: string;
}

export interface WebrtcOfferPayload {
	callId: string;
	/** Joined participant that should receive the offer. */
	to: PeerId;
	sdp: SdpPayload;
}

export interface WebrtcAnswerPayload {
	callId: string;
	to: PeerId;
	sdp: SdpPayload;
}

export interface WebrtcIcePayload {
	callId: string;
	to: PeerId;
	candidate: IceCandidatePayload;
}

export interface CallMediaStatePayload {
	callId: string;
	audio: boolean;
	video: boolean;
}

// ─── Server -> client ───────────────────────────────────────────────

export const ServerCallEvents = {
	INCOMING: "call:incoming",
	PEERS: "call:peers",
	PEER_JOINED: "call:peer-joined",
	PEER_LEFT: "call:peer-left",
	BUSY: "call:busy",
	FULL: "call:full",
	ENDED: "call:ended",
	HANDLED: "call:handled",
	OFFER: "webrtc:offer",
	ANSWER: "webrtc:answer",
	ICE: "webrtc:ice",
	MEDIA_STATE: "call:media-state",
} as const;

export type ServerCallEvent =
	(typeof ServerCallEvents)[keyof typeof ServerCallEvents];

export interface CallIncomingPayload {
	callId: string;
	from: PeerId;
	type: CallType;
	conversationId: string;
}

export interface CallPeersPayload {
	callId: string;
	peers: CallPeerInfo[];
}

export interface CallPeerJoinedPayload {
	callId: string;
	peerId: PeerId;
}

export interface CallPeerLeftPayload {
	callId: string;
	peerId: PeerId;
}

export interface CallBusyPayload {
	callId: string;
	peerId: PeerId;
}

export interface CallFullPayload {
	callId: string;
}

export interface CallEndedPayload {
	callId: string;
	reason: CallEndReason;
}

export interface CallHandledPayload {
	callId: string;
}

export interface WebrtcOfferRelayPayload {
	callId: string;
	from: string;
	sdp: SdpPayload;
}

export interface WebrtcAnswerRelayPayload {
	callId: string;
	from: string;
	sdp: SdpPayload;
}

export interface WebrtcIceRelayPayload {
	callId: string;
	from: string;
	candidate: IceCandidatePayload;
}

export interface CallMediaStateRelayPayload {
	callId: string;
	peerId: PeerId;
	audio: boolean;
	video: boolean;
}

// ─── REST (GET /calls/ice-servers, POST /calls/history shape) ───────

export interface IceServerEntry {
	urls: string | string[];
	username?: string;
	credential?: string;
}

export interface IceServersResponse {
	iceServers: IceServerEntry[];
	/** Unix seconds when the TURN credentials expire. */
	expiresAt: number;
}

export interface CallHistoryParticipant {
	userId: string | null;
	visitorId: string | null;
	status: CallParticipantStatus;
	joinedAt: string | null;
	leftAt: string | null;
}

export interface CallHistoryItem {
	id: string;
	conversationId: string;
	startedById: string;
	type: CallType;
	status: CallStatus;
	startedAt: string;
	answeredAt: string | null;
	endedAt: string | null;
	endReason: CallEndReason | null;
	/** Seconds between answeredAt and endedAt (0 when never answered). */
	durationSeconds: number;
	participants: CallHistoryParticipant[];
}

// ─── Shared limits (server env vars override these defaults) ────────

/** Mesh cap: one RTCPeerConnection per remote peer. */
export const DEFAULT_CALL_MAX_PARTICIPANTS = 4;

/** Seconds the server rings before marking a call MISSED. */
export const DEFAULT_CALL_RING_TIMEOUT_SECONDS = 30;
