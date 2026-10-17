import { createHmac } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import type { IceServersResponse } from "@package/call-signaling";

/** TURN credential TTL: short-lived per coturn REST (`use-auth-secret`) scheme. */
const TURN_CREDENTIAL_TTL_SECONDS = 3600;

function parseUrlList(raw: string | undefined): string[] {
	if (!raw) return [];
	return raw
		.split(",")
		.map((url) => url.trim())
		.filter(Boolean);
}

@Injectable()
export class TurnService {
	private readonly logger = new Logger(TurnService.name);

	/**
	 * Issues short-lived TURN credentials for one user via the coturn REST
	 * scheme: username is `<expiryUnix>:<userId>`, credential is the
	 * base64 HMAC-SHA1 of the username keyed with TURN_SECRET (which must
	 * match `static-auth-secret` in turnserver.conf). Never logs credentials.
	 */
	getIceServers(userId: string): IceServersResponse {
		const stunUrls = parseUrlList(process.env.STUN_URLS);
		const turnUrls = parseUrlList(process.env.TURN_URLS);
		const turnSecret = process.env.TURN_SECRET;
		const expiresAt = Math.floor(Date.now() / 1000) + TURN_CREDENTIAL_TTL_SECONDS;

		const iceServers: IceServersResponse["iceServers"] = [];
		if (stunUrls.length > 0) {
			iceServers.push({ urls: stunUrls });
		}
		if (turnUrls.length > 0 && turnSecret) {
			const username = `${expiresAt}:${userId}`;
			const credential = createHmac("sha1", turnSecret)
				.update(username)
				.digest("base64");
			iceServers.push({ urls: turnUrls, username, credential });
		} else {
			this.logger.warn(
				"TURN_URLS or TURN_SECRET is not set - issuing STUN-only ICE servers",
			);
		}
		return { iceServers, expiresAt };
	}
}
