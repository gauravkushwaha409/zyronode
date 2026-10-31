import { Inject, Injectable, Logger } from "@nestjs/common";
import type { App } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";
import { FIREBASE_APP } from "./firebase.provider";
import type { BrowserPushMessage } from "./notifications.types";

const MULTICAST_CHUNK_SIZE = 500;

/** FCM error codes that mean the token is dead and must be pruned. */
const INVALID_TOKEN_CODES = new Set([
	"messaging/registration-token-not-registered",
	"messaging/invalid-registration-token",
	"messaging/invalid-argument",
	"messaging/authentication-error",
]);

@Injectable()
export class PushService {
	private readonly logger = new Logger(PushService.name);

	constructor(@Inject(FIREBASE_APP) private readonly app: App | null) {}

	get enabled(): boolean {
		return this.app !== null;
	}

	/**
	 * Sends a data-only web push to every token. Never throws: delivery
	 * failures are logged, and dead tokens are returned so callers can prune.
	 */
	async sendToTokens(
		tokens: string[],
		message: BrowserPushMessage,
	): Promise<string[]> {
		const uniqueTokens = [...new Set(tokens.filter(Boolean))];
		if (uniqueTokens.length === 0) return [];
		if (!this.app) {
			this.logger.debug(
				`FCM disabled; skipped push "${message.title}" to ${uniqueTokens.length} token(s)`,
			);
			return [];
		}

		const data = this.toDataPayload(message);
		const invalidTokens: string[] = [];

		for (let i = 0; i < uniqueTokens.length; i += MULTICAST_CHUNK_SIZE) {
			const chunk = uniqueTokens.slice(i, i + MULTICAST_CHUNK_SIZE);
			const payload: MulticastMessage = {
				tokens: chunk,
				data,
				webpush: {
					headers: { Urgency: message.urgency ?? "normal" },
					fcmOptions: { link: data.link },
				},
			};

			try {
				const response = await getMessaging(this.app).sendEachForMulticast(payload);
				response.responses.forEach((result, index) => {
					if (result.success) return;
					const code = result.error?.code ?? "unknown";
					if (INVALID_TOKEN_CODES.has(code)) invalidTokens.push(chunk[index]);
					this.logger.warn(
						`FCM send failed (${code}) for token ${chunk[index].slice(0, 12)}…`,
					);
				});
				this.logger.debug(
					`FCM sent "${message.title}" to ${response.successCount}/${chunk.length} token(s)`,
				);
			} catch (err) {
				this.logger.error(
					`FCM multicast failed for "${message.title}": ${(err as Error).message}`,
				);
			}
		}

		return invalidTokens;
	}

	/** FCM data payloads are flat and string-only. */
	private toDataPayload(message: BrowserPushMessage): Record<string, string> {
		const raw: Record<string, string | undefined> = {
			...message.data,
			title: message.title,
			body: message.body,
		};
		const data: Record<string, string> = {};
		for (const [key, value] of Object.entries(raw)) {
			if (value !== undefined) data[key] = String(value);
		}
		return data;
	}
}
