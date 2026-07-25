import { useCallback, useState } from "react";
import { useQueryClient } from "@package/query";
import { useEvent, useChannel } from "@package/websocket";
import { CONFIG } from "@/config";

interface SessionSocketEventsProps {
  sessionId: string;
  organizationId: string;
}

interface MessageNewEvent {
  session: { id: string };
  message: { id: string; senderType: string };
}

interface TypingUpdateEvent {
  sessionId: string;
  isTyping: boolean;
  senderType: string;
}

export function SessionSocketEvents({ sessionId, organizationId }: SessionSocketEventsProps) {
  const queryClient = useQueryClient();
  const [visitorTyping, setVisitorTyping] = useState(false);

  useChannel("session:join", { sessionId });

  useEvent<MessageNewEvent>(
    "message:new",
    useCallback(
      (data) => {
        if (data.session.id === sessionId) {
          queryClient.invalidateQueries({
            queryKey: CONFIG.QUERY_KEY.INBOX.SESSION_DETAIL(sessionId, organizationId),
          });
        }
        queryClient.invalidateQueries({
          queryKey: CONFIG.QUERY_KEY.INBOX.SESSIONS(organizationId),
        });
      },
      [queryClient, sessionId, organizationId],
    ),
  );

  useEvent<TypingUpdateEvent>(
    "typing:update",
    useCallback(
      (data) => {
        if (data.sessionId === sessionId && data.senderType === "VISITOR") {
          setVisitorTyping(data.isTyping);
        }
      },
      [sessionId],
    ),
  );

  return visitorTyping ? (
    <div className="px-4 py-1">
      <span className="text-xs text-gray-400 italic">Visitor is typing...</span>
    </div>
  ) : null;
}
