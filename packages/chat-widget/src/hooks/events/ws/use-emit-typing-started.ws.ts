import { useEvent, useWebSocket } from "@package/websocket";
import { useCallback } from "react";

interface EmitPayload {
  conversationId: string;
}

export function useEmitTypingStarted() {
  const { client, status } = useWebSocket();
  const emitTypingStarted = useCallback(
    (payload: EmitPayload) => {
      if (status !== "connected") return;
      client.emit("typing:start", payload);
    },
    [client, status],
  );
  return { emitTypingStarted };
}
