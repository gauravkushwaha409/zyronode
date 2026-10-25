import { create } from 'zustand';
import type { Message } from '../types';

interface MessageDeleteStore {
  message: Message.ConversationMessage | null;
  setMessage: (message: Message.ConversationMessage) => void;
  clearMessage: () => void;
  isDeleting: (messageUuid: string) => boolean;
}

export const useMessageDeleteStore = create<MessageDeleteStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isDeleting: (messageUuid) => get().message?.uuid === messageUuid,
}));
