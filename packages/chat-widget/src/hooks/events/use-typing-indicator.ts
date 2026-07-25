import { useCallback, useEffect, useRef, useState } from "react";
import { useEmitTypingStarted, useEmitTypingStopped, useOnTypingUpdate } from "./ws";
import type { TypingUpdateEventData } from "./event-types";

const DEBOUNCE_MS = 300;
const STOP_DELAY_MS = 5000;

interface UseTypingIndicatorOptions {
  sessionId: string | null;
}

interface TypingState {
  isTyping: boolean;
  senderType: "VISITOR" | "AGENT" | null;
}

export function useTypingIndicator({ sessionId }: UseTypingIndicatorOptions) {
  const [typingState, setTypingState] = useState<TypingState>({
    isTyping: false,
    senderType: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const sessionIdRef = useRef(sessionId);

  sessionIdRef.current = sessionId;

  const { emitTypingStarted } = useEmitTypingStarted();
  const { emitTypingStopped } = useEmitTypingStopped();
  const { onTypingUpdate } = useOnTypingUpdate();

  onTypingUpdate((payload: TypingUpdateEventData) => {
    if (payload.senderType === "AGENT") {
      setTypingState({
        isTyping: payload.isTyping,
        senderType: "AGENT",
      });
    }
  });

  const emitStop = useCallback(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    emitTypingStopped({ sessionId: sid });
  }, [emitTypingStopped]);

  const startTyping = useCallback(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emitTypingStarted({ sessionId: sid });
    }, DEBOUNCE_MS);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      emitStop();
    }, STOP_DELAY_MS);
  }, [emitTypingStarted, emitStop]);

  const stopTyping = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    emitStop();
  }, [emitStop]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      emitStop();
    };
  }, [emitStop]);

  return {
    startTyping,
    stopTyping,
    isAgentTyping: typingState.isTyping && typingState.senderType === "AGENT",
  };
}
