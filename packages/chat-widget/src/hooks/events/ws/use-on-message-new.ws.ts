import { useChannel, useEvent } from "@package/websocket";

export function useOnMessageNew(
  conversationId: string,
  handler: (data: unknown) => void,
) {
  useChannel("conversation:join", { conversationId });
  useEvent("message:new", handler);
}
