export class SseError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SseError";
    this.cause = cause;
  }
}
