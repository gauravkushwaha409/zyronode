import type { ChatWidgetTab } from "@/types";
import { create } from "zustand";

interface ChatWidgetStore {
  activeTab: ChatWidgetTab;
  isOpen: boolean;
  setActiveTab: (tab: ChatWidgetTab) => void;
  setIsOpen: (open: boolean) => void;
}

export const useChatWidgetStore = create<ChatWidgetStore>()((set) => ({
  activeTab: "chat",
  isOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsOpen: (open) => set({ isOpen: open }),
}));
