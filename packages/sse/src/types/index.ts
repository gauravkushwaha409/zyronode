export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

export interface SseClientOptions {
  url: string;
  withCredentials?: boolean;
  retry?: number;
  maxRetries?: number;
}
