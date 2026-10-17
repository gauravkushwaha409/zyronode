import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useChatWidgetConfig } from "../config";
import { getConversationId, setConversationId } from "../lib/storage";
import { getWidgetApi } from "../services/widget-api.service";

interface ConversationState {
	/** Conversation id, restored from localStorage or created lazily. */
	id: string | null;
	/** True while `ensure()` is creating a conversation. */
	isCreating: boolean;
	/** Creates (or restores) a conversation and returns its id. */
	ensure: () => Promise<string>;
}

interface VisitorSessionContextValue {
	visitorId: string | null;
	organizationId: string | null;
	conversation: ConversationState;
}

const VisitorSessionContext = createContext<VisitorSessionContextValue>({
	visitorId: null,
	organizationId: null,
	conversation: {
		id: null,
		isCreating: false,
		ensure: async () => {
			throw new Error("[chat-widget] VisitorSessionContextProvider not mounted");
		},
	},
});

interface VisitorSessionContextProviderProps {
	organizationId?: string;
	children: ReactNode;
}

/**
 * Visitor session + conversation provider.
 *
 * - Fires `startSession` on mount, exposing the returned `visitorId`.
 * - Owns conversation state (lazy creation) so there is no separate
 *   conversation provider: consumers read `conversation` off this context.
 */
export function VisitorSessionContextProvider({
	organizationId,
	children,
}: VisitorSessionContextProviderProps) {
	const config = useChatWidgetConfig();
	const orgId = organizationId ?? config.organizationId ?? null;
	const pageUrl = window.location.href;
	const [visitorId, setVisitorId] = useState<string | null>(null);

	useEffect(() => {
		if (!orgId)
			throw new Error("Organization ID is required for visitor session");
		void getWidgetApi()
			.startSession(orgId, { sourceUrl: window.location.href })
			.then((res) => {
				const id = res?.data?.data?.id;
				if (id) setVisitorId(id);
			})
			.catch(() => {
				throw new Error("Failed to start visitor session");
			});
	}, [orgId]);

	const [conversationId, setConversationIdState] = useState<string | null>(() =>
		getConversationId(orgId),
	);
	const [isCreating, setIsCreating] = useState(false);
	const pendingRef = useRef<Promise<string> | null>(null);

	useEffect(() => {
		setConversationIdState(getConversationId(orgId));
		pendingRef.current = null;
	}, [orgId]);

	/**
	 * Ensures a conversation exists:
	 * 1. returns the id stored in localStorage, if present
	 * 2. returns the id already in state, if present
	 * 3. dedupes concurrent calls via a single in-flight promise
	 * 4. otherwise `POST /conversations`, stores the id, and returns it
	 */
	const ensure = useCallback(async (): Promise<string> => {
		const stored = getConversationId(orgId);
		if (stored) {
			if (stored !== conversationId) setConversationIdState(stored);
			return stored;
		}
		if (conversationId) return conversationId;
		if (pendingRef.current) return pendingRef.current;
		if (!orgId) {
			throw new Error(
				"[chat-widget] organizationId is required to create a conversation",
			);
		}

		// Ensure visitor exists before linking — avoids race where first message
		// is sent before this provider's async startSession resolves.
		let resolvedVisitorId = visitorId;
		if (!resolvedVisitorId) {
			try {
				const sessionRes = await getWidgetApi().startSession(orgId, {
					sourceUrl: pageUrl,
				});
				resolvedVisitorId = sessionRes?.data?.data?.id ?? null;
			} catch {
				// best-effort — conversation will be created without visitor link
			}
		}

		setIsCreating(true);
		const promise = getWidgetApi()
			.createConversation({
				organizationId: orgId,
				// Link conversation → visitor so `conversation.visitor` is not null
				...(resolvedVisitorId ? { visitorId: resolvedVisitorId } : {}),
				sourceUrl: pageUrl,
				channel: "web",
			})
			.then((res) => {
				const id =
					(res as unknown as { data?: { data?: { id?: string } } })?.data?.data
						?.id ?? (res as unknown as { data?: { id?: string } })?.data?.id;
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
	}, [conversationId, orgId, pageUrl, visitorId]);

	const conversation = useMemo<ConversationState>(
		() => ({ id: conversationId, isCreating, ensure }),
		[conversationId, isCreating, ensure],
	);

	return (
		<VisitorSessionContext.Provider
			value={{ visitorId, organizationId: orgId, conversation }}
		>
			{children}
		</VisitorSessionContext.Provider>
	);
}

export function useVisitorSession(): VisitorSessionContextValue {
	return useContext(VisitorSessionContext);
}
