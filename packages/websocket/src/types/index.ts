export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

export interface WebSocketClientOptions {
  url: string;
  path?: string;
  transports?: ("websocket" | "polling")[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  withCredentials?: boolean;
}
