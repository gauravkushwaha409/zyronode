export class WebSocketError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "WebSocketError";
    this.cause = cause;
  }
}
