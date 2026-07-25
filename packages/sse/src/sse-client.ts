import type { ConnectionStatus, SseClientOptions } from "./types/index.js";

type ListenerEntry = {
  event: string;
  listener: EventListener;
};

export class SseClient {
  private eventSource: EventSource | null = null;
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private retryCount = 0;
  private maxRetries: number;
  private retryDelay: number;
  private url: string;
  private withCredentials: boolean;
  private shouldReconnect = true;
  private pendingListeners: ListenerEntry[] = [];
  private cleanupFns: Map<string, Set<() => void>> = new Map();

  constructor(options: SseClientOptions) {
    this.url = options.url;
    this.withCredentials = options.withCredentials ?? true;
    this.maxRetries = options.maxRetries ?? 10;
    this.retryDelay = options.retry ?? 5000;
  }

  get connected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.notify("connecting");
    this.eventSource = new EventSource(this.url, {
      withCredentials: this.withCredentials,
    });

    this.eventSource.onopen = () => {
      this.retryCount = 0;
      this.notify("connected");
    };

    this.eventSource.onerror = () => {
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.notify("disconnected");
        this.handleReconnect();
      } else {
        this.notify("connecting");
      }
    };

    for (const entry of this.pendingListeners) {
      this.eventSource.addEventListener(entry.event, entry.listener);
    }
  }

  on<T>(event: string, handler: (data: T) => void): () => void {
    const listener = (e: Event) => {
      const msgEvent = e as MessageEvent;
      try {
        const data = JSON.parse(msgEvent.data) as T;
        handler(data);
      } catch {
        handler(msgEvent.data as unknown as T);
      }
    };

    if (this.eventSource) {
      this.eventSource.addEventListener(event, listener);
    } else {
      this.pendingListeners.push({ event, listener });
    }

    if (!this.cleanupFns.has(event)) {
      this.cleanupFns.set(event, new Set());
    }
    const cleanup = () => {
      this.cleanupFns.get(event)?.delete(cleanup);
      this.pendingListeners = this.pendingListeners.filter(
        (l) => l.listener !== listener,
      );
      this.eventSource?.removeEventListener(event, listener);
    };
    this.cleanupFns.get(event)?.add(cleanup);

    return cleanup;
  }

  close(): void {
    this.shouldReconnect = false;
    this.eventSource?.close();
    this.eventSource = null;
    this.pendingListeners = [];
    this.cleanupFns.clear();
    this.notify("disconnected");
  }

  onStatus(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private handleReconnect(): void {
    if (!this.shouldReconnect) return;
    if (this.retryCount >= this.maxRetries) return;

    this.retryCount++;
    const delay = Math.min(this.retryDelay * 2 ** (this.retryCount - 1), 30000);
    this.notify("reconnecting");

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }

  private notify(status: ConnectionStatus): void {
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}
