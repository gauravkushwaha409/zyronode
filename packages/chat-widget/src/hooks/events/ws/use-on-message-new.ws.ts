import { useChannel, useEvent } from "@package/websocket";

export function useOnMessageNew<T = unknown>(
	conversationId: string,
	handler: (data: T) => void,
) {
	useChannel("conversation:join", { conversationId });
	useEvent<T>("message:new", handler);
}
