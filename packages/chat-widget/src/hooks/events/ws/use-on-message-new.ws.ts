import { useChannel, useEvent } from "@package/websocket";

export function useOnMessageNew(
  sessionId: string,
  handler: (data: unknown) => void,
) {
  useChannel("session:join", { sessionId });
  useEvent("message:new", handler);
}
