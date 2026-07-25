import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SseClient } from "../sse-client.js";
import type { ConnectionStatus, SseClientOptions } from "../types/index.js";

interface SseContextValue {
  client: SseClient;
  status: ConnectionStatus;
}

export const SseContext = createContext<SseContextValue | null>(null);

export interface SseProviderProps {
  options: SseClientOptions;
  children: ReactNode;
}

export function SseProvider({ options, children }: SseProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const clientRef = useRef<SseClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = new SseClient(options);
  }

  const client = clientRef.current;

  useEffect(() => {
    return client.onStatus(setStatus);
  }, [client]);

  useEffect(() => {
    client.connect();
    return () => {
      client.close();
    };
  }, [client]);

  return (
    <SseContext.Provider value={{ client, status }}>
      {children}
    </SseContext.Provider>
  );
}

export function useSse(): SseContextValue {
  const ctx = useContext(SseContext);
  if (!ctx) {
    throw new Error("useSse must be used within a <SseProvider>");
  }
  return ctx;
}
