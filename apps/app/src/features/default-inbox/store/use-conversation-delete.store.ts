import { create } from "zustand";

interface ConversationDeleteTarget {
	conversationId: string;
	organizationId: string;
}

interface ConversationDeleteStore {
	target: ConversationDeleteTarget | null;
	setTarget: (target: ConversationDeleteTarget) => void;
	clearTarget: () => void;
	isDeleting: (conversationId: string) => boolean;
}

export const useConversationDeleteStore = create<ConversationDeleteStore>(
	(set, get) => ({
		target: null,
		setTarget: (target) => set({ target }),
		clearTarget: () => set({ target: null }),
		isDeleting: (conversationId) => get().target?.conversationId === conversationId,
	}),
);
