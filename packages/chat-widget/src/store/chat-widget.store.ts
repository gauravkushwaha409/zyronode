import { create } from "zustand";
import type { ChatWidgetTab } from "@/types";

interface ChatWidgetStore {
	activeTab: ChatWidgetTab;
	isOpen: boolean;
	unreadCount: number;
	setActiveTab: (tab: ChatWidgetTab) => void;
	setIsOpen: (open: boolean) => void;
	incrementUnread: () => void;
	clearUnread: () => void;
	setUnreadCount: (count: number) => void;
}

export const useChatWidgetStore = create<ChatWidgetStore>()((set) => ({
	activeTab: "chat",
	isOpen: false,
	unreadCount: 0,
	setActiveTab: (tab) => set({ activeTab: tab }),
	setIsOpen: (open) => set({ isOpen: open }),
	incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
	clearUnread: () => set({ unreadCount: 0 }),
	setUnreadCount: (count) => set({ unreadCount: count }),
}));
