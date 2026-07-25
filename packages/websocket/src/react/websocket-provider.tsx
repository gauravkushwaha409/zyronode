import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WebSocketClient } from "../websocket-client.js";
import type { ConnectionStatus, WebSocketClientOptions } from "../types/index.js";

interface WebSocketContextValue {
  client: WebSocketClient;
  status: ConnectionStatus;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export interface WebSocketProviderProps {
  options: WebSocketClientOptions;
  auth?: Record<string, unknown>;
  children: ReactNode;
}

export function WebSocketProvider({
  options,
  auth,
  children,
}: WebSocketProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const clientRef = useRef<WebSocketClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = new WebSocketClient(options);
  }

  const client = clientRef.current;

  useEffect(() => {
    return client.onStatus(setStatus);
  }, [client]);

  useEffect(() => {
    client.connect(auth);
  }, [client, auth]);

  return (
    <WebSocketContext.Provider value={{ client, status }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used within a <WebSocketProvider>");
  }
  return ctx;
}
