import { useContext, useEffect, useRef } from "react";
import { WebSocketContext } from "./websocket-provider.js";

export function useEvent<T>(event: string, handler: (data: T) => void): void {
  const ctx = useContext(WebSocketContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!ctx) return;
    return ctx.client.on(event, (data: T) => {
      handlerRef.current(data);
    });
  }, [ctx, event]);
}
