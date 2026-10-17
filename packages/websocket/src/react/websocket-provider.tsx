import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type {
	ConnectionStatus,
	WebSocketClientOptions,
} from "../types/index.js";
import { WebSocketClient } from "../websocket-client.js";

interface WebSocketContextValue {
	client: WebSocketClient;
	status: ConnectionStatus;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(
	null,
);

export interface WebSocketProviderProps {
	options: WebSocketClientOptions;
	auth?: Record<string, unknown>;
	children: ReactNode;
}

export function WebSocketProvider({
	options,
	auth,
	children,
}: WebSocketProviderProps) {
	const [status, setStatus] = useState<ConnectionStatus>("disconnected");
	const clientRef = useRef<WebSocketClient | null>(null);

	if (!clientRef.current) {
		clientRef.current = new WebSocketClient(options);
	}

	const client = clientRef.current;

	// Serialized auth: callers pass fresh object literals (`auth={{...}}`),
	// so identity comparison would reconnect on every render. Reconnect only
	// when the payload actually changes; disconnect only on unmount.
	const authKey = auth ? JSON.stringify(auth) : "";
	const lastAuthKey = useRef<string | null>(null);

	useEffect(() => {
		return client.onStatus(setStatus);
	}, [client]);

	useEffect(() => {
		if (lastAuthKey.current === authKey) return;
		lastAuthKey.current = authKey;
		if (auth) {
			client.connect(auth);
		} else {
			client.disconnect();
		}
	}, [client, auth, authKey]);

	useEffect(() => {
		return () => {
			client.disconnect();
		};
	}, [client]);

	return (
		<WebSocketContext.Provider value={{ client, status }}>
			{children}
		</WebSocketContext.Provider>
	);
}

export function useWebSocket(): WebSocketContextValue {
	const ctx = useContext(WebSocketContext);
	if (!ctx) {
		throw new Error("useWebSocket must be used within a <WebSocketProvider>");
	}
	return ctx;
}
