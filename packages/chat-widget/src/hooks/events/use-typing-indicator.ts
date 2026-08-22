import { useCallback, useEffect, useRef, useState } from "react";
import { useEmitTypingStarted, useEmitTypingStopped, useOnTypingUpdate } from "./ws";
import type { TypingUpdateEventData } from "./event-types";

const DEBOUNCE_MS = 300;
const STOP_DELAY_MS = 5000;

interface UseTypingIndicatorOptions {
  conversationId: string | null;
}

interface TypingState {
  isTyping: boolean;
  senderType: "VISITOR" | "AGENT" | null;
}

export function useTypingIndicator({ conversationId }: UseTypingIndicatorOptions) {
  const [typingState, setTypingState] = useState<TypingState>({
    isTyping: false,
    senderType: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const conversationIdRef = useRef(conversationId);

  conversationIdRef.current = conversationId;

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
    const cid = conversationIdRef.current;
    if (!cid) return;
    emitTypingStopped({ conversationId: cid });
  }, [emitTypingStopped]);

  const startTyping = useCallback(() => {
    const cid = conversationIdRef.current;
    if (!cid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emitTypingStarted({ conversationId: cid });
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
