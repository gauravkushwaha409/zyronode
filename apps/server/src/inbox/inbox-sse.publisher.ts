import { Injectable, Logger } from "@nestjs/common";
import { SseKey } from "../sse/keys";
import { SseService } from "../sse/sse.service";
import {
	WIDGET_SSE_EVENTS,
	type WidgetSseEvent,
} from "../visitor/events/widget-event.types";

/**
 * SSE-only publisher for inbox-scoped realtime events.
 *
 * Owned by `inbox/` — keeps all `org:<id>` / `conversation:<id>` SSE
 * fanout for conversation lifecycle inside the inbox bounded context
 * instead of leaking through `visitor/events`.
 *
 * Transport is `SseService.publish(keys, event, data)` (Redis fanout).
 * No WebSocket logic — WS is handled separately by gateways /
 * `WebsocketService` if needed.
 */
@Injectable()
export class InboxSsePublisher {
	private readonly logger = new Logger(InboxSsePublisher.name);

	constructor(private readonly sse: SseService) {}

	/**
	 * Returns the SSE keys for a given organization ID.
	 * @param organizationId The ID of the organization.
	 * @returns An array of SSE keys.
	 */
	private orgKeys(organizationId: string): string[] {
		return [SseKey.org(organizationId)];
	}

	private conversationKeys(conversationId: string): string[] {
		return [SseKey.conversation(conversationId)];
	}

	/* ──────────────────────── transport core ──────────────────────── */

	private async emitSse(
		keys: string[],
		sseEvent: string,
		data: unknown,
	): Promise<void> {
		try {
			await this.sse.publish(keys, sseEvent, data);
		} catch (err) {
			this.logger.warn(
				`SSE publish failed ${sseEvent}: ${(err as Error).message}`,
			);
		}
	}

	/**
	 * Generic SSE emit. Prefer typed methods below for discoverability.
	 */
	async emit(
		sseEvent: WidgetSseEvent,
		data: unknown,
		scope: { organizationId?: string | null; conversationId?: string },
	): Promise<void> {
		const keys: string[] = [];
		if (scope.organizationId) keys.push(...this.orgKeys(scope.organizationId));
		if (scope.conversationId)
			keys.push(...this.conversationKeys(scope.conversationId));

		await this.emitSse(keys.length ? keys : ["__no_key__"], sseEvent, data);
	}

	/**
	 * Publishes a conversation created event.
	 */
	async conversationCreated(params: {
		organizationId: string;
		conversation: unknown;
	}): Promise<void> {
		await this.emitSse(
			this.orgKeys(params.organizationId),
			WIDGET_SSE_EVENTS.CONVERSATION_CREATED,
			params.conversation,
		);
	}

	/**
	 * Publishes a conversation updated event.
	 * @param params The parameters for the conversation updated event.
	 */
	async conversationUpdated(params: {
		organizationId: string;
		conversation: unknown;
	}): Promise<void> {
		await this.emitSse(
			this.orgKeys(params.organizationId),
			WIDGET_SSE_EVENTS.CONVERSATION_UPDATED,
			params.conversation,
		);
	}

	/**
	 * Publishes a conversation deleted event.
	 * @param params The parameters for the conversation deleted event.
	 */
	async conversationDeleted(params: {
		conversationId: string;
		organizationId: string;
	}): Promise<void> {
		await this.emitSse(
			this.orgKeys(params.organizationId),
			WIDGET_SSE_EVENTS.CONVERSATION_DELETED,
			params.conversationId,
		);
	}
}
