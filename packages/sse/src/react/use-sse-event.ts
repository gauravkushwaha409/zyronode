import { useContext, useEffect, useRef } from "react";
import { SseContext } from "./sse-provider.js";

export function useSseEvent<T>(
  event: string,
  handler: (data: T) => void,
): void {
  const ctx = useContext(SseContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!ctx) return;
    return ctx.client.on(event, (data: T) => {
      handlerRef.current(data);
    });
  }, [ctx, event]);
}
