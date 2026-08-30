import {
	createContext,
	type ReactNode,
	useContext,
	useState,
} from "react";
import { getConfig } from "../config";
import { getConversationId, setConversationId } from "../lib/storage";

interface ConversationContextValue {
	conversationId: string | null;
	organizationId: string;
	page: string;
	setConversationId: (id: string) => void;
}

const ConversationContext = createContext<ConversationContextValue>({
	conversationId: null,
	organizationId: "",
	page: "",
	setConversationId: () => {},
});

interface ConversationProviderProps {
	children: ReactNode;
	organizationId?: string;
	page?: string;
}

/**
 * Restores an existing conversation from localStorage (if any) and
 * exposes conversation state via context. Conversations are created
 * lazily when the visitor sends their first message.
 */
export function ConversationProvider({
	children,
	organizationId,
	page,
}: ConversationProviderProps) {
	const config = getConfig();
	const orgId = organizationId ?? config.organizationId;
	const pageUrl = page ?? window.location.href;

	const [conversationId, setConversationIdState] = useState<string | null>(
		getConversationId,
	);

	const handleSetConversationId = (id: string) => {
		setConversationId(id);
		setConversationIdState(id);
	};

	return (
		<ConversationContext.Provider
			value={{
				conversationId,
				organizationId: orgId,
				page: pageUrl,
				setConversationId: handleSetConversationId,
			}}
		>
			{children}
		</ConversationContext.Provider>
	);
}

export function useConversation(): ConversationContextValue {
	return useContext(ConversationContext);
}
