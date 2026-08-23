import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { getConfig } from "../config";
import { useCreateConversationMutation } from "../hooks";
import { getConversationId, setConversationId } from "../lib/storage";

interface ConversationContextValue {
	conversationId: string | null;
}

const ConversationContext = createContext<ConversationContextValue>({
	conversationId: null,
});

interface ConversationProviderProps {
	children: ReactNode;
	organizationId?: string;
	page?: string;
}

/**
 * Creates a visitor conversation on first mount (or restores the
 * existing one from localStorage) and exposes it via context.
 */
export function ConversationProvider({
	children,
	organizationId,
	page,
}: ConversationProviderProps) {
	const config = getConfig();
	const orgId = organizationId ?? config.organizationId;

	const [conversationId, setConversationIdState] = useState<string | null>(
		getConversationId,
	);

	const { mutate: createConversation } = useCreateConversationMutation();

	useEffect(() => {
		if (conversationId) return;
		createConversation(
			{
				organizationId: orgId,
				sourceUrl: page ?? window.location.href,
				channel: "web",
			},
			{
				onSuccess: (res: { data?: { data?: { id?: string } } }) => {
					const id = res.data?.data?.id;
					if (id) {
						setConversationId(id);
						setConversationIdState(id);
					}
				},
				onError: (err: unknown) => {
					console.error("[chat-widget] Conversation creation failed:", err);
				},
			},
		);
	}, [conversationId, orgId, page, createConversation]);

	return (
		<ConversationContext.Provider value={{ conversationId }}>
			{children}
		</ConversationContext.Provider>
	);
}

export function useConversation(): ConversationContextValue {
	return useContext(ConversationContext);
}
