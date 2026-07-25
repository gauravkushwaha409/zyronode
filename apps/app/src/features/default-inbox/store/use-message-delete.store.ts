import { create } from 'zustand';
import type { ConversationMessageTypes } from '../types';

interface MessageDeleteStore {
  message: ConversationMessageTypes.ConversationMessage | null;
  setMessage: (message: ConversationMessageTypes.ConversationMessage) => void;
  clearMessage: () => void;
  isDeleting: (messageUuid: string) => boolean;
}

export const useMessageDeleteStore = create<MessageDeleteStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isDeleting: (messageUuid) => get().message?.uuid === messageUuid,
}));
