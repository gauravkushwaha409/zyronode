import { useCallback, useState } from "react";
import { useQueryClient } from "@package/query";
import { useEvent, useChannel } from "@package/websocket";
import { CONFIG } from "@/config";

interface ConversationSocketEventsProps {
  conversationId: string;
  organizationId: string;
}

interface MessageNewEvent {
  conversation: { id: string };
  message: { id: string; senderType: string };
}

interface TypingUpdateEvent {
  conversationId: string;
  isTyping: boolean;
  senderType: string;
}

export function ConversationSocketEvents({ conversationId, organizationId }: ConversationSocketEventsProps) {
  const queryClient = useQueryClient();
  const [visitorTyping, setVisitorTyping] = useState(false);

  useChannel("conversation:join", { conversationId });

  useEvent<MessageNewEvent>(
    "message:new",
    useCallback(
      (data) => {
        if (data.conversation.id === conversationId) {
          queryClient.invalidateQueries({
            queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversationId, organizationId),
          });
        }
        queryClient.invalidateQueries({
          queryKey: CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
        });
      },
      [queryClient, conversationId, organizationId],
    ),
  );

  useEvent<TypingUpdateEvent>(
    "typing:update",
    useCallback(
      (data) => {
        if (data.conversationId === conversationId && data.senderType === "VISITOR") {
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
