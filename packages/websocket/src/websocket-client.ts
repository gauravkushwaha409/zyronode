import { io, type Socket } from "socket.io-client";
import { WebSocketError } from "./websocket-error.js";
import type { ConnectionStatus, WebSocketClientOptions } from "./types/index.js";

export class WebSocketClient {
  private socket: Socket;
  private statusListeners = new Set<(status: ConnectionStatus) => void>();

  constructor(options: WebSocketClientOptions) {
    this.socket = io(options.url, {
      path: options.path ?? "/socket.io",
      transports: options.transports ?? ["websocket"],
      autoConnect: false,
      reconnection: options.reconnection ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? 10,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
      withCredentials: options.withCredentials ?? false,
    });

    this.socket.on("connect", () => {
      this.notify("connected");
    });
    this.socket.on("disconnect", () => {
      this.notify("disconnected");
    });
    this.socket.on("connect_error", () => {
      this.notify("connecting");
    });
    this.socket.on("reconnect_attempt", () => {
      this.notify("reconnecting");
    });
  }

  get connected(): boolean {
    return this.socket.connected;
  }

  get id(): string | undefined {
    return this.socket.id;
  }

  connect(auth?: Record<string, unknown>): void {
    if (this.socket.connected) return;
    if (auth) {
      this.socket.auth = auth;
    }
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  emit<T>(event: string, data: T): void {
    if (!this.socket.connected) {
      throw new WebSocketError(
        `Cannot emit "${event}": socket is not connected`,
      );
    }
    this.socket.emit(event, data);
  }

  on<T>(event: string, handler: (data: T) => void): () => void {
    this.socket.on(event, handler);
    return () => {
      this.socket.off(event, handler);
    };
  }

  onStatus(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private notify(status: ConnectionStatus): void {
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}
