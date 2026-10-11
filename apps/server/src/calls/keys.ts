/**
 * Redis key layout for live call state. Postgres is the durable record;
 * Redis holds only ephemeral presence with TTLs as a backstop - every key
 * is also cleared explicitly on each terminal transition.
 */

/** call:{id} hash: { status, conversationId, type, ringDeadline }. */
export function callKey(callId: string): string {
	return `call:${callId}`;
}

/** call:{id}:participants set of joined userIds. */
export function callParticipantsKey(callId: string): string {
	return `call:${callId}:participants`;
}

/** call:{id}:media hash userId -> JSON { audio, video }. */
export function callMediaKey(callId: string): string {
	return `call:${callId}:media`;
}

/** call:{id}:ring marker with TTL = ring timeout (glare/deadline checks). */
export function callRingKey(callId: string): string {
	return `call:${callId}:ring`;
}

/**
 * peer:{peerId}:activeCall string -> callId, where peerId is `user:<id>` or
 * `visitor:<id>`. Acquired with SET NX so a peer can be in only one call at
 * a time (busy detection).
 */
export function peerActiveCallKey(peerId: string): string {
	return `peer:${peerId}:activeCall`;
}

/** Backstop TTL for presence keys (explicitly cleared on end regardless). */
export const CALL_PRESENCE_TTL_SECONDS = 12 * 3600;
