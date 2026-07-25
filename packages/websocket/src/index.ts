export { WebSocketClient } from "./websocket-client.js";
export { WebSocketError } from "./websocket-error.js";
export type { ConnectionStatus, WebSocketClientOptions } from "./types/index.js";

export {
  WebSocketProvider,
  useWebSocket,
  type WebSocketProviderProps,
} from "./react/websocket-provider.js";
export { useEvent } from "./react/use-event.js";
export { useChannel } from "./react/use-channel.js";
