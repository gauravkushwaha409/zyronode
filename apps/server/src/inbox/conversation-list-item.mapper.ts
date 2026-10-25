import type { Prisma } from "../generated/prisma/client";

/** Same includes used by the conversation list endpoint and realtime conversation events. */
export const conversationListInclude = {
	messages: {
		orderBy: { createdAt: "desc" },
		take: 1,
		select: {
			id: true,
			content: true,
			senderType: true,
			messageType: true,
			createdAt: true,
			replyTo: true,
			replyToId: true,
		},
	},
	_count: {
		select: {
			messages: {
				where: { senderType: "VISITOR", status: { not: "READ" } },
			},
		},
	},
	visitor: {
		select: {
			id: true,
			name: true,
			email: true,
		},
	},
} satisfies Prisma.ConversationInclude;

export type ConversationListRecord = Prisma.ConversationGetPayload<{
	include: typeof conversationListInclude;
}>;

export interface InboxConversationListItem {
	id: string;
	status: ConversationListRecord["status"];
	channel: string;
	visitor: {
		id: string;
		name: string | null;
		email: string | null;
		isOnline: boolean;
	} | null;
	lastMessageAt: Date;
	createdAt: Date;
	lastMessage: {
		content: string;
		senderType: ConversationListRecord["messages"][number]["senderType"];
		messageType: ConversationListRecord["messages"][number]["messageType"];
		createdAt: Date;
	} | null;
	unreadCount: number;
}

/** Maps a conversation row to the exact shape returned by the conversation list endpoint. */
export function toConversationListItem(
	conversation: ConversationListRecord,
	onlineVisitorIds: Set<string>,
): InboxConversationListItem {
	const lastMessage = conversation.messages[0] ?? null;

	return {
		id: conversation.id,
		status: conversation.status,
		channel: conversation.channel,
		visitor: conversation.visitor
			? {
					...conversation.visitor,
					isOnline: onlineVisitorIds.has(conversation.visitor.id),
				}
			: null,
		lastMessageAt: conversation.updatedAt,
		createdAt: conversation.createdAt,
		lastMessage: lastMessage
			? {
					content: lastMessage.content,
					senderType: lastMessage.senderType,
					messageType: lastMessage.messageType,
					createdAt: lastMessage.createdAt,
				}
			: null,
		unreadCount: conversation._count.messages,
	};
}
