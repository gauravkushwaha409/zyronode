/** Browser-only push payload. Delivery is data-only so the client decides
 * whether to render an OS notification (foreground vs background). */
export interface BrowserPushMessage {
	title: string;
	body: string;
	/** Extra string data merged into the FCM data payload (type, ids, link...). */
	data?: Record<string, string>;
	/** `high` wakes the device immediately (used for calls). */
	urgency?: "high" | "normal";
}

export interface RegisterPushTokenInput {
	token: string;
	userAgent?: string;
}
