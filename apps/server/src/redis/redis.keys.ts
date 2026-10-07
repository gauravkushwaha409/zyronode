import { OtpPurpose } from "../otp/types/otp-purpose.type";

/**
 * Single source of truth for every Redis key and pub/sub channel.
 * Changing a string here orphans existing data stored under the old key.
 */
export const RedisKey = {
	/** ZSET per org: member = visitorId, score = last heartbeat epoch ms. */
	visitorPresence: (organizationId: string) =>
		`visitor-presence:${organizationId}` as const,
	/** STRING: OTP code for an email + purpose, expires after OTP TTL. */
	otp: (purpose: OtpPurpose, email: string) =>
		`otp:${purpose}:${email}` as const,
	/** STRING: userId for a password-reset token, expires after reset TTL. */
	passwordReset: (token: string) => `password-reset:${token}` as const,
} as const;

export const RedisChannel = {
	/** SSE fan-out across server instances (see SseService). */
	sseBroadcast: "sse:broadcast",
} as const;
