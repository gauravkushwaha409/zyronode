import { useWebSocket } from "@package/websocket";
import { useCallback } from "react";

interface EmitPayload {
  sessionId: string;
}

export function useEmitTypingStopped() {
  const { client, status } = useWebSocket();
  const emitTypingStopped = useCallback(
    (payload: EmitPayload) => {
      if (status !== "connected") return;
      client.emit("typing:stop", payload);
    },
    [client, status],
  );
  return { emitTypingStopped };
}
