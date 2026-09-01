import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { getConfig } from "../config";
import { getConversationId, setConversationId } from "../lib/storage";
import { getWidgetApi } from "../services/widget-api.service";

interface ConversationContextValue {
	conversationId: string | null;
	isCreating: boolean;
	ensureConversation: () => Promise<string>;
}

const ConversationContext = createContext<ConversationContextValue>({
	conversationId: null,
	isCreating: false,
	ensureConversation: async () => {
		throw new Error("[chat-widget] ConversationProvider not mounted");
	},
});

interface ConversationProviderProps {
	children: ReactNode;
	organizationId?: string;
	page?: string;
}

/**
 * Lazy conversation provider.
 *
 * - Restores `conversationId` from localStorage on mount (no network call).
 * - DOES NOT auto-create a conversation when the widget opens.
 * - Exposes `ensureConversation()` which:
 *   1. returns stored id if present
 *   2. otherwise `POST /api/v1/conversations` (via `CHAT_WIDGET_API.CONVERSATIONS`), stores id in localStorage, and returns it
 *   3. dedupes concurrent calls (single in-flight promise)
 *
 * Flow for visitor chat:
 *   visitor opens widget -> no network call
 *   visitor sends message -> ChatWidgetChat.handleSend() calls ensureConversation() -> creates conversation -> saves id -> sends message
 *
 * This prevents empty conversations for every widget open.
 */
export function ConversationProvider({
	children,
	organizationId,
	page,
}: ConversationProviderProps) {
	const config = getConfig();
	const orgId = organizationId ?? config.organizationId;

	const [conversationId, setConversationIdState] = useState<string | null>(
		() => getConversationId(orgId),
	);
	const [isCreating, setIsCreating] = useState(false);
	const pendingRef = useRef<Promise<string> | null>(null);

	useEffect(() => {
		setConversationIdState(getConversationId(orgId));
		pendingRef.current = null;
	}, [orgId]);

	const ensureConversation = useCallback(async (): Promise<string> => {
		const stored = getConversationId(orgId);
		if (stored) {
			if (stored !== conversationId) setConversationIdState(stored);
			return stored;
		}
		if (conversationId) return conversationId;
		if (pendingRef.current) return pendingRef.current;
		if (!orgId) {
			throw new Error("[chat-widget] organizationId is required to create a conversation");
		}

		setIsCreating(true);
		const promise = getWidgetApi()
			.createConversation({
				organizationId: orgId,
				sourceUrl: page ?? (typeof window !== "undefined" ? window.location.href : undefined),
				channel: "web",
			})
			.then((res) => {
				const id = (res as unknown as { data?: { data?: { id?: string } } })?.data?.data?.id ?? (res as unknown as { data?: { id?: string } })?.data?.id;
				if (!id) throw new Error("Conversation creation returned no id");
				setConversationId(id, orgId);
				setConversationIdState(id);
				return id;
			})
			.catch((err: unknown) => {
				console.error("[chat-widget] Conversation creation failed:", err);
				throw err;
			})
			.finally(() => {
				setIsCreating(false);
				pendingRef.current = null;
			});

		pendingRef.current = promise;
		return promise;
	}, [conversationId, orgId, page]);

	return (
		<ConversationContext.Provider value={{ conversationId, isCreating, ensureConversation }}>
			{children}
		</ConversationContext.Provider>
	);
}

export function useConversation(): ConversationContextValue {
	return useContext(ConversationContext);
}
