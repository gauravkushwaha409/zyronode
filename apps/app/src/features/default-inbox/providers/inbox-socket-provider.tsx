import { useCallback } from "react";
import { useQueryClient } from "@package/query";
import { WebSocketProvider, useEvent, useChannel } from "@package/websocket";
import { CONFIG } from "@/config";

const SOCKET_URL = window.location.origin;

interface InboxSocketProviderProps {
  organizationId: string;
  children: React.ReactNode;
}

interface MessageNewEvent {
  session: { id: string };
  message: unknown;
}

interface SessionUpdatedEvent {
  session: { id: string };
}

function InboxSocketEvents({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient();

  useChannel("agent:join", { organizationId });

  useEvent<MessageNewEvent>("message:new", useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: CONFIG.QUERY_KEY.INBOX.SESSIONS(organizationId),
    });
  }, [queryClient, organizationId]));

  useEvent<SessionUpdatedEvent>("session:updated", useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: CONFIG.QUERY_KEY.INBOX.SESSIONS(organizationId),
    });
  }, [queryClient, organizationId]));

  return null;
}

export function InboxSocketProvider({ organizationId, children }: InboxSocketProviderProps) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <WebSocketProvider
      options={{
        url: SOCKET_URL,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        withCredentials: true,
      }}
      auth={{ token }}
    >
      <InboxSocketEvents organizationId={organizationId} />
      {children}
    </WebSocketProvider>
  );
}
