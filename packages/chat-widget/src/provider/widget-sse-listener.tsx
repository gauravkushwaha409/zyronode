import { useQueryClient } from "@package/query";
import { useSseEvent } from "@package/sse";
import { useChatWidgetStore } from "../store";
import { applyChatMessageEvent, type ChatMessageEvent } from "../utility";
import { useConversation } from "./conversation-provider";

interface WidgetSseListenerProps {
	isWidgetOpen: boolean;
}

/**
 * Always-mounted SSE listener for visitor messages.
 *
 * - Mounted outside <Activity> so it stays subscribed even when widget is hidden.
 * - Requires <WidgetSseProvider> ancestor (gracefully no-ops if no conversationId yet).
 * - Patches react-query cache via applyChatMessageEvent and bumps unread badge
 *   when a non-visitor message arrives while hidden.
 */
export function WidgetSseListener({ isWidgetOpen }: WidgetSseListenerProps) {
	const { conversationId } = useConversation();
	const queryClient = useQueryClient();
	const incrementUnread = useChatWidgetStore((s) => s.incrementUnread);

	useSseEvent<ChatMessageEvent>("message.created", (data) => {
		if (!conversationId) return;
		if (data.conversation?.id !== conversationId) return;

		applyChatMessageEvent(queryClient, conversationId, data);

		if (!isWidgetOpen && data.message?.senderType !== "VISITOR") {
			incrementUnread();
		}
	});

	return null;
}
