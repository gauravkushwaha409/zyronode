import { create } from 'zustand';
import type { Message } from '../types';

interface MessageEditStore {
  message: Message.ConversationMessage | null;
  setMessage: (message: Message.ConversationMessage) => void;
  clearMessage: () => void;
  isEditing: (messageUuid: string) => boolean;
}

export const useMessageEditStore = create<MessageEditStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isEditing: (messageUuid) => get().message?.uuid === messageUuid,
}));
