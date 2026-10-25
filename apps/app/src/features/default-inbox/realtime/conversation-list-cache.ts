import type { ApiResponse } from "@package/api-client";
import type { QueryClient } from "@package/query";
import type { InfiniteData } from "@tanstack/react-query";
import { CONFIG } from "@/config";
import type { ConversationTypes } from "../types/inbox-api.types";
import type { ConversationEventData } from "./types";

export type ConversationsInfinite = InfiniteData<
	ApiResponse<ConversationTypes.InboxConversationsData>
>;

export interface ConversationListFilters {
	status?: string;
	search?: string;
	limit?: number;
	[key: string]: unknown;
}

export function forEachConversationList(
	queryClient: QueryClient,
	organizationId: string,
	transform: (
		data: ConversationsInfinite,
		filters: ConversationListFilters,
	) => ConversationsInfinite,
): void {
	const queries = queryClient.getQueryCache().findAll({
		queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
	});

	for (const query of queries) {
		const data = query.state.data as ConversationsInfinite | undefined;
		if (!data?.pages.length) continue;

		const filters = (query.queryKey[3] ?? {}) as ConversationListFilters;
		const next = transform(data, filters);
		if (next !== data) queryClient.setQueryData(query.queryKey, next);
	}
}

export function findConversationListItem(
	data: ConversationsInfinite,
	conversationId: string,
): ConversationTypes.InboxConversationListItem | undefined {
	for (const page of data.pages) {
		const found = page.data?.data?.conversations.find(
			(c) => c.id === conversationId,
		);
		if (found) return found;
	}
	return undefined;
}

export function withConversationRemoved(
	data: ConversationsInfinite,
	conversationId: string,
): ConversationsInfinite {
	let changed = false;

	const pages = data.pages.map((page) => {
		const list = page.data?.data;
		if (!list) return page;

		const conversations = list.conversations.filter(
			(c) => c.id !== conversationId,
		);
		if (conversations.length === list.conversations.length) return page;

		changed = true;
		return {
			...page,
			data: { ...page.data, data: { ...list, conversations } },
		};
	});

	return changed ? { ...data, pages } : data;
}

export function withConversationPrepended(
	data: ConversationsInfinite,
	item: ConversationTypes.InboxConversationListItem,
): ConversationsInfinite {
	const [firstPage, ...restPages] = data.pages;
	const firstList = firstPage?.data?.data;
	if (!firstPage || !firstList) return data;

	return {
		...data,
		pages: [
			{
				...firstPage,
				data: {
					...firstPage.data,
					data: {
						...firstList,
						conversations: [item, ...firstList.conversations],
					},
				},
			},
			...restPages,
		],
	};
}

export function matchesConversationFilters(
	item: ConversationTypes.InboxConversationListItem,
	filters: ConversationListFilters,
): boolean {
	if (filters.status && filters.status !== item.status) return false;

	if (filters.search) {
		const search = filters.search.toLowerCase();
		return (
			(item.visitor?.name ?? "").toLowerCase().includes(search) ||
			(item.visitor?.email ?? "").toLowerCase().includes(search)
		);
	}

	return true;
}

export function mergeConversationListItem(
	item: ConversationTypes.InboxConversationListItem,
	conversation: ConversationEventData,
): ConversationTypes.InboxConversationListItem {
	const visitor =
		conversation.visitor !== undefined
			? conversation.visitor
				? {
						id: conversation.visitor.id,
						name: conversation.visitor.name,
						email: conversation.visitor.email,
						isOnline:
							conversation.visitor.isOnline ?? item.visitor?.isOnline ?? false,
					}
				: null
			: conversation.visitorId !== undefined ||
					conversation.visitorName !== undefined ||
					conversation.visitorEmail !== undefined
				? {
						id: conversation.visitorId ?? item.visitor?.id ?? "",
						name: conversation.visitorName ?? item.visitor?.name ?? null,
						email: conversation.visitorEmail ?? item.visitor?.email ?? null,
						isOnline: item.visitor?.isOnline ?? false,
					}
				: item.visitor;

	return {
		...item,
		status: conversation.status ?? item.status,
		channel: conversation.channel ?? item.channel,
		visitor,
		createdAt: conversation.createdAt ?? item.createdAt,
		lastMessage:
			conversation.lastMessage === undefined
				? item.lastMessage
				: conversation.lastMessage,
		lastMessageAt:
			conversation.lastMessageAt ??
			conversation.lastMessage?.createdAt ??
			conversation.updatedAt ??
			item.lastMessageAt,
		unreadCount: conversation.unreadCount ?? item.unreadCount,
	};
}
