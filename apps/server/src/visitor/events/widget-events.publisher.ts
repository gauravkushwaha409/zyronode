import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SseKey } from "../../sse/keys";
import { SseService } from "../../sse/sse.service";
import { WebsocketService } from "../../websocket/websocket.service";
import {
	SSE_TO_WS_EVENT_MAP,
	WIDGET_SSE_EVENTS,
	type WidgetSseEvent,
} from "./widget-event.types";

/**
 * Centralized, scalable publisher for every visitor/widget server → client event.
 */
@Injectable()
export class WidgetEventsPublisher {
	private readonly logger = new Logger(WidgetEventsPublisher.name);

	constructor(
		private readonly websocketService: WebsocketService,
		private readonly sse: SseService,
		private readonly prisma: PrismaService,
	) {}

	/* ───────────────────────── key helpers — centralized in sse/keys.ts ───────────────────────── */

	private orgKeys(organizationId: string): string[] {
		return [SseKey.org(organizationId)];
	}

	private conversationKeys(conversationId: string): string[] {
		return [SseKey.conversation(conversationId)];
	}

	private visitorKeys(visitorId: string): string[] {
		return [SseKey.visitor(visitorId)];
	}

	private widgetKeys(
		organizationId: string | null,
		conversationId: string,
	): string[] {
		return organizationId
			? [SseKey.org(organizationId), SseKey.conversation(conversationId)]
			: [SseKey.conversation(conversationId)];
	}

	private visitorScopeKeys(organizationId: string, visitorId: string): string[] {
		return [SseKey.org(organizationId), SseKey.visitor(visitorId)];
	}

	/* ──────────────────────── transport core ──────────────────────── */

	/** Emit to WS rooms (org +/or conversation). Fire-and-forget, never throws. */
	private emitWs(params: {
		conversationId?: string;
		organizationId?: string | null;
		wsEvent: string;
		data: Record<string, unknown>;
	}): void {
		try {
			if (params.conversationId) {
				this.websocketService.emitToConversation(
					params.conversationId,
					params.wsEvent,
					params.data,
				);
			}
			if (params.organizationId) {
				this.websocketService.emitToOrg(
					params.organizationId,
					params.wsEvent,
					params.data,
				);
			}
		} catch (err) {
			this.logger.warn(
				`WS emit failed ${params.wsEvent}: ${(err as Error).message}`,
			);
		}
	}

	/** Publish to SSE (Redis fanout). Awaited by callers that need delivery guarantee. */
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
	 * Generic dual emit: resolves WS name via SSE_TO_WS_EVENT_MAP, emits to WS
	 * (org + conversation) and SSE (union keys). Prefer typed methods below
	 * for discoverability; this is the escape hatch for new events.
	 */
	async emit(
		sseEvent: WidgetSseEvent,
		data: unknown,
		scope: { organizationId?: string | null; conversationId?: string },
	): Promise<void> {
		const wsEvent = SSE_TO_WS_EVENT_MAP[sseEvent] ?? sseEvent;
		const keys: string[] = [];
		if (scope.organizationId) keys.push(...this.orgKeys(scope.organizationId));
		if (scope.conversationId)
			keys.push(...this.conversationKeys(scope.conversationId));

		this.emitWs({
			conversationId: scope.conversationId,
			organizationId: scope.organizationId ?? null,
			wsEvent,
			data: data as Record<string, unknown>,
		});
		await this.emitSse(keys.length ? keys : ["__no_key__"], sseEvent, data);
	}

	/** Resolve organizationId from conversation when caller doesn't have it. Centralizes the Prisma lookup that was duplicated in 3 controllers. */
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

	/** Message created (visitor or agent) — dual broadcast to both scopes so agent inbox + widget get it. */
	async messageCreated(params: {
		conversationId: string;
		message: unknown;
		organizationId?: string | null;
	}): Promise<void> {
		const orgId =
			params.organizationId !== undefined
				? params.organizationId
				: await this.resolveOrgId(params.conversationId);
		const data = {
			conversation: { id: params.conversationId },
			message: params.message,
		};
		const keys = this.widgetKeys(orgId, params.conversationId);
		this.emitWs({
			conversationId: params.conversationId,
			organizationId: orgId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.MESSAGE_CREATED],
			data: data as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.MESSAGE_CREATED, data);
	}

	async visitorConnected(
		organizationId: string,
		payload: { visitorId: string; externalId: string | null },
	): Promise<void> {
		const data = { ...payload, isOnline: true as const };
		const keys = this.visitorScopeKeys(organizationId, payload.visitorId);
		// visitor presence is SSE-only today (WS heartbeat is client->server), but also mirror to WS for symmetry
		this.emitWs({
			organizationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.VISITOR_CONNECTED],
			data: data as unknown as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.VISITOR_CONNECTED, data);
		// If visitor has conversation(s), notify inbox (agent/inbox SSE + WS org room)
		// so conversation list can flip `visitor.isOnline` without refetch.
		await this.emitConversationPresenceForVisitor(
			organizationId,
			payload.visitorId,
			true,
		);
	}

	async visitorDisconnected(
		organizationId: string,
		payload: { visitorId: string; externalId: string | null },
	): Promise<void> {
		const data = { ...payload, isOnline: false as const };
		const keys = this.visitorScopeKeys(organizationId, payload.visitorId);
		this.emitWs({
			organizationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.VISITOR_DISCONNECTED],
			data: data as unknown as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.VISITOR_DISCONNECTED, data);
		await this.emitConversationPresenceForVisitor(
			organizationId,
			payload.visitorId,
			false,
		);
	}

	/**
	 * Check if visitor has any active conversation and emit to agent/inbox
	 * so conversation list can flip `visitor.isOnline` without refetch.
	 */
	private async emitConversationPresenceForVisitor(
		organizationId: string,
		visitorId: string,
		isOnline: boolean,
	): Promise<void> {
		try {
			const conversations = await this.prisma.conversation.findMany({
				where: { organizationId, visitorId, deletedAt: null },
				select: { id: true },
			});
			if (conversations.length === 0) return;

			for (const conv of conversations) {
				const data = {
					conversationId: conv.id,
					visitorId,
					isOnline,
				};
				await this.emitSse(
					[...this.orgKeys(organizationId), ...this.conversationKeys(conv.id)],
					WIDGET_SSE_EVENTS.CONVERSATION_PRESENCE,
					data,
				);
			}
		} catch (err) {
			this.logger.warn(
				`Failed to emit conversation presence for visitor ${visitorId}: ${(err as Error).message}`,
			);
		}
	}

	async visitorCreated(organizationId: string, visitor: unknown): Promise<void> {
		const data = { visitor };
		const visitorId = (visitor as { id?: string })?.id;
		const keys = visitorId
			? this.visitorScopeKeys(organizationId, visitorId)
			: this.orgKeys(organizationId);
		this.emitWs({
			organizationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.VISITOR_CREATED],
			data: data as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.VISITOR_CREATED, data);
	}

	async visitorUpdated(organizationId: string, visitor: unknown): Promise<void> {
		const data = { visitor };
		const visitorId = (visitor as { id?: string })?.id;
		const keys = visitorId
			? this.visitorScopeKeys(organizationId, visitorId)
			: this.orgKeys(organizationId);
		this.emitWs({
			organizationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.VISITOR_UPDATED],
			data: data as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.VISITOR_UPDATED, data);
	}

	async visitorAssigned(
		organizationId: string,
		visitor: unknown,
	): Promise<void> {
		const data = { visitor };
		const visitorId = (visitor as { id?: string })?.id;
		const keys = visitorId
			? this.visitorScopeKeys(organizationId, visitorId)
			: this.orgKeys(organizationId);
		this.emitWs({
			organizationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.VISITOR_ASSIGNED],
			data: data as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.VISITOR_ASSIGNED, data);
	}

	async visitorNoteCreated(
		organizationId: string,
		data: { visitorId: string; note: unknown },
	): Promise<void> {
		const keys = this.visitorScopeKeys(organizationId, data.visitorId);
		this.emitWs({
			organizationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.VISITOR_NOTE_CREATED],
			data: data as unknown as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.VISITOR_NOTE_CREATED, data);
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
		this.emitWs({
			conversationId: params.conversationId,
			organizationId: orgId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.CONVERSATION_UPDATED],
			data: data as Record<string, unknown>,
		});
		await this.emitSse(keys, WIDGET_SSE_EVENTS.CONVERSATION_UPDATED, data);
	}

	/** Typing is WS-only (low latency, no need for SSE persistence). Publisher still centralizes the room. */
	typingUpdate(params: {
		conversationId: string;
		senderType: string;
		isTyping: boolean;
		senderId?: string;
	}): void {
		const data = {
			conversationId: params.conversationId,
			senderType: params.senderType,
			isTyping: params.isTyping,
			...(params.senderId ? { senderId: params.senderId } : {}),
		};
		// typing is conversation-scoped only; broadcast to others in room
		this.emitWs({
			conversationId: params.conversationId,
			wsEvent: SSE_TO_WS_EVENT_MAP[WIDGET_SSE_EVENTS.TYPING_UPDATE],
			data: data as Record<string, unknown>,
		});
		// no SSE — not needed
	}

	/**
	 * Pre-conversation push to a specific visitor.
	 * Widget opens `GET /widget/sse/visitor/:visitorId` immediately after session-start,
	 * so this can deliver welcome prompts, assignment notices, or any info before
	 * a conversation exists. Publishes to `visitor:${visitorId}` (and `org:${orgId}` if given)
	 * so it works with both the new visitor SSE and the existing org SSE.
	 */
	async publishToVisitor(params: {
		visitorId: string;
		organizationId?: string | null;
		event: WidgetSseEvent;
		data: unknown;
	}): Promise<void> {
		const keys = params.organizationId
			? this.visitorScopeKeys(params.organizationId, params.visitorId)
			: this.visitorKeys(params.visitorId);
		const wsEvent = SSE_TO_WS_EVENT_MAP[params.event] ?? params.event;
		// Visitor pre-conversation is SSE-primary; mirror to WS for symmetry if org known
		if (params.organizationId) {
			this.emitWs({
				organizationId: params.organizationId,
				wsEvent,
				data: params.data as Record<string, unknown>,
			});
		}
		await this.emitSse(keys, params.event, params.data);
	}
}
