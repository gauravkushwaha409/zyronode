import { useEffect } from "react";
import { useWebSocket } from "./websocket-provider.js";

export function useChannel(
  event: string,
  data?: Record<string, unknown>,
): void {
  const { client, status } = useWebSocket();

  useEffect(() => {
    if (status !== "connected") return;
    client.emit(event, { ...data });
    return () => {
      client.emit(event, { ...data, action: "leave" });
    };
  }, [client, event, data, status]);
}
