import { useSseEvent } from "@package/sse";

export function useOnMessageNew(handler: (data: unknown) => void): void {
  useSseEvent("message:new", handler);
}
