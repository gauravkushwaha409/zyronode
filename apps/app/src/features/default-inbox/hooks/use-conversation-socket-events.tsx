import { useChannel, useEvent } from "@package/websocket";
import { useCallback, useState } from "react";

interface ConversationSocketEventsProps {
	conversationId: string;
}

interface TypingUpdateEvent {
	conversationId: string;
	isTyping: boolean;
	senderType: string;
}

export function ConversationSocketEvents({
	conversationId,
}: ConversationSocketEventsProps) {
	const [visitorTyping, setVisitorTyping] = useState(false);

	useChannel("conversation:join", { conversationId });

	useEvent<TypingUpdateEvent>(
		"typing:update",
		useCallback(
			(data) => {
				if (
					data.conversationId === conversationId &&
					data.senderType === "VISITOR"
				) {
					setVisitorTyping(data.isTyping);
				}
			},
			[conversationId],
		),
	);

	return visitorTyping ? (
		<div className="px-4 py-1">
			<span className="text-xs text-gray-400 italic">Visitor is typing...</span>
		</div>
	) : null;
}
