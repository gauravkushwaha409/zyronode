import { Injectable, Logger } from "@nestjs/common";
import { parsePeerId } from "@package/call-signaling";
import { PrismaService } from "../prisma/prisma.service";
import type { BrowserPushMessage } from "./notifications.types";
import { PushService } from "./push.service";
import { PushTokensService } from "./push-tokens.service";

interface MessageCreatedEvent {
	conversationId: string;
	organizationId?: string | null;
	message: {
		id?: string;
		content?: string;
		senderType?: string;
		messageType?: string;
	};
}

interface IncomingCallEvent {
	callId: string;
	conversationId: string;
	callType: "AUDIO" | "VIDEO";
	callerPeerId: string;
	targetPeerIds: string[];
}

interface MissedCallEvent {
	callId: string;
	conversationId: string;
	callType: "AUDIO" | "VIDEO";
	userIds: string[];
	visitorIds: string[];
}

const MAX_BODY_LENGTH = 140;

/**
 * Business policy for browser push. Owns *who* gets notified and *what* the
 * payload looks like; PushService only concerns itself with FCM delivery.
 * Every method is fire-and-forget safe: it never throws to the caller so a
 * push failure can never block message/call delivery.
 */
@Injectable()
export class PushNotifierService {
	private readonly logger = new Logger(PushNotifierService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly push: PushService,
		private readonly pushTokens: PushTokensService,
	) {}

	async onMessageCreated(event: MessageCreatedEvent): Promise<void> {
		try {
			const { message } = event;
			if (message.messageType === "INTERNAL_NOTE") return;
			if (message.senderType !== "VISITOR" && message.senderType !== "AGENT") {
				return;
			}
			if (!this.push.enabled) return;

			const conversation = await this.prisma.conversation.findFirst({
				where: { id: event.conversationId, deletedAt: null },
				select: {
					id: true,
					organizationId: true,
					visitorId: true,
					visitorName: true,
					visitor: { select: { id: true, name: true, assignedAgentId: true } },
					organization: { select: { name: true } },
				},
			});
			if (!conversation) return;

			const organizationId = event.organizationId ?? conversation.organizationId;
			const body = this.previewBody(message);
			const data = {
				type: "message",
				// Unique per message so the service worker does not replace (and
				// silently swallow) the previous notification for the same chat.
				messageId: message.id ?? "",
				conversationId: conversation.id,
				organizationId,
				senderType: message.senderType,
			};

			if (message.senderType === "VISITOR") {
				const recipientIds = await this.resolveAgentRecipients(conversation);
				const name =
					conversation.visitor?.name ??
					conversation.visitorName ??
					"New visitor message";
				await this.sendToUsers(recipientIds, {
					title: name,
					body,
					data: { ...data, link: this.inboxLink(organizationId, conversation.id) },
				});
				return;
			}

			const visitorId = conversation.visitor?.id ?? conversation.visitorId;
			if (!visitorId) return;
			await this.sendToVisitors([visitorId], {
				title: `New reply from ${conversation.organization.name}`,
				body,
				data,
			});
		} catch (err) {
			this.logger.warn(`onMessageCreated push failed: ${(err as Error).message}`);
		}
	}

	async onIncomingCall(event: IncomingCallEvent): Promise<void> {
		try {
			if (!this.push.enabled || event.targetPeerIds.length === 0) return;

			const callerName = await this.resolvePeerName(event.callerPeerId);
			const kind = event.callType === "VIDEO" ? "video" : "voice";
			const message: BrowserPushMessage = {
				title: `Incoming ${kind} call`,
				body: callerName ? `${callerName} is calling` : "Someone is calling",
				urgency: "high",
				data: {
					type: "call",
					callId: event.callId,
					conversationId: event.conversationId,
					callType: event.callType,
					callerPeerId: event.callerPeerId,
				},
			};

			const userIds: string[] = [];
			const visitorIds: string[] = [];
			for (const peerId of event.targetPeerIds) {
				const parsed = parsePeerId(peerId);
				if (!parsed) continue;
				if (parsed.kind === "user") userIds.push(parsed.id);
				else visitorIds.push(parsed.id);
			}

			await Promise.all([
				this.sendToUsers(userIds, message),
				this.sendToVisitors(visitorIds, message),
			]);
		} catch (err) {
			this.logger.warn(`onIncomingCall push failed: ${(err as Error).message}`);
		}
	}

	async onMissedCall(event: MissedCallEvent): Promise<void> {
		try {
			if (!this.push.enabled) return;
			if (event.userIds.length === 0 && event.visitorIds.length === 0) return;

			const kind = event.callType === "VIDEO" ? "video" : "voice";
			const message: BrowserPushMessage = {
				title: `Missed ${kind} call`,
				body: "You missed a call",
				urgency: "normal",
				data: {
					type: "call_missed",
					callId: event.callId,
					conversationId: event.conversationId,
					callType: event.callType,
				},
			};

			await Promise.all([
				this.sendToUsers(event.userIds, message),
				this.sendToVisitors(event.visitorIds, message),
			]);
		} catch (err) {
			this.logger.warn(`onMissedCall push failed: ${(err as Error).message}`);
		}
	}

	private async resolveAgentRecipients(conversation: {
		organizationId: string;
		visitor: { assignedAgentId: string | null } | null;
	}): Promise<string[]> {
		const assignedAgentId = conversation.visitor?.assignedAgentId;
		if (assignedAgentId) return [assignedAgentId];

		const members = await this.prisma.organizationMember.findMany({
			where: { organizationId: conversation.organizationId },
			select: { userId: true },
		});
		return members.map((member) => member.userId);
	}

	private async resolvePeerName(peerId: string): Promise<string | null> {
		const parsed = parsePeerId(peerId);
		if (!parsed) return null;
		if (parsed.kind === "user") {
			const user = await this.prisma.user.findUnique({
				where: { id: parsed.id },
				select: { firstName: true, lastName: true },
			});
			if (!user) return null;
			return [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
		}
		const visitor = await this.prisma.visitor.findUnique({
			where: { id: parsed.id },
			select: { name: true },
		});
		return visitor?.name ?? null;
	}

	private async sendToUsers(
		userIds: string[],
		message: BrowserPushMessage,
	): Promise<void> {
		const ids = [...new Set(userIds)];
		if (ids.length === 0) return;
		const tokens = await this.pushTokens.getTokensForUsers(ids);
		await this.deliver(tokens, message);
	}

	private async sendToVisitors(
		visitorIds: string[],
		message: BrowserPushMessage,
	): Promise<void> {
		const ids = [...new Set(visitorIds)];
		if (ids.length === 0) return;
		const tokens = await this.pushTokens.getTokensForVisitors(ids);
		await this.deliver(tokens, message);
	}

	private async deliver(
		tokens: string[],
		message: BrowserPushMessage,
	): Promise<void> {
		const invalidTokens = await this.push.sendToTokens(tokens, message);
		if (invalidTokens.length > 0) await this.pushTokens.prune(invalidTokens);
	}

	private previewBody(message: {
		content?: string;
		messageType?: string;
	}): string {
		if (message.messageType && message.messageType !== "TEXT") {
			return this.typeLabel(message.messageType);
		}
		const content = (message.content ?? "").trim();
		if (!content) return "New message";
		return content.length > MAX_BODY_LENGTH
			? `${content.slice(0, MAX_BODY_LENGTH)}…`
			: content;
	}

	private typeLabel(messageType: string): string {
		switch (messageType) {
			case "IMAGE":
				return "Sent an image";
			case "FILE":
			case "DOCUMENT":
				return "Sent a file";
			case "AUDIO":
				return "Sent a voice message";
			case "VIDEO":
				return "Sent a video";
			default:
				return "New message";
		}
	}

	private inboxLink(organizationId: string, conversationId: string): string {
		return `/${organizationId}/inbox?conversation=${conversationId}`;
	}
}
