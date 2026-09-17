import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SseKey } from "../sse/keys";
import { SseService } from "../sse/sse.service";
import { WIDGET_SSE_EVENTS, type WidgetSseEvent } from "../visitor/events/widget-event.types";

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

	constructor(
		private readonly sse: SseService,
		private readonly prisma: PrismaService,
	) {}

	/* ───────────────────────── key helpers ───────────────────────── */

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

	private async resolveOrgId(conversationId: string): Promise<string | null> {
		try {
			const conversation = await this.prisma.conversation.findFirst({
				where: { id: conversationId, deletedAt: null },
				select: { organizationId: true },
			});
			return conversation?.organizationId ?? null;
		} catch {
			return null;
		}
	}

	/* ───────────────────── typed domain methods ───────────────────── */

	async conversationCreated(params: {
		conversationId: string;
		organizationId?: string | null;
		conversation: unknown;
	}): Promise<void> {
		const orgId =
			params.organizationId !== undefined
				? params.organizationId
				: await this.resolveOrgId(params.conversationId);
		const data = { conversation: params.conversation };
		const keys = orgId
			? this.orgKeys(orgId)
			: this.conversationKeys(params.conversationId);
		await this.emitSse(keys, WIDGET_SSE_EVENTS.CONVERSATION_CREATED, data);
	}

	async conversationUpdated(params: {
		conversationId: string;
		organizationId?: string | null;
		conversation: unknown;
	}): Promise<void> {
		const orgId =
			params.organizationId !== undefined
				? params.organizationId
				: await this.resolveOrgId(params.conversationId);
		const data = { conversation: params.conversation };
		const keys = orgId
			? this.orgKeys(orgId)
			: this.conversationKeys(params.conversationId);
		await this.emitSse(keys, WIDGET_SSE_EVENTS.CONVERSATION_UPDATED, data);
	}

	async conversationDeleted(params: {
		conversationId: string;
		organizationId: string;
	}): Promise<void> {
		const data = { conversationId: params.conversationId };
		const keys = this.orgKeys(params.organizationId);
		// Reuse CONVERSATION_UPDATED with deleted flag for SSE clients that only
		// listen to INBOX_EVENTS.
		// If a dedicated `conversation.deleted` event is needed, add it to
		// WIDGET_SSE_EVENTS and map it here.
		await this.emitSse(keys, WIDGET_SSE_EVENTS.CONVERSATION_UPDATED, {
			conversation: {
				id: params.conversationId,
				deletedAt: new Date().toISOString(),
			},
			...data,
		});
	}
}
