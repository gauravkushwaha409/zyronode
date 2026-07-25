import { useEvent } from "@package/websocket";
import { useCallback, useRef } from "react";
import type { TypingUpdateEventData } from "../event-types";

type Handler = (data: TypingUpdateEventData) => void;

export function useOnTypingUpdate() {
  const handlerRef = useRef<Handler>(() => {});
  useEvent<TypingUpdateEventData>("typing:update", (data: TypingUpdateEventData) => {
    handlerRef.current(data);
  });
  const onTypingUpdate = useCallback((handler: Handler) => {
    handlerRef.current = handler;
  }, []);
  return { onTypingUpdate };
}
