import { create } from 'zustand';
import type { ConversationMessageTypes } from '../types';

interface MessageEditStore {
  message: ConversationMessageTypes.ConversationMessage | null;
  setMessage: (message: ConversationMessageTypes.ConversationMessage) => void;
  clearMessage: () => void;
  isEditing: (messageUuid: string) => boolean;
}

export const useMessageEditStore = create<MessageEditStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isEditing: (messageUuid) => get().message?.uuid === messageUuid,
}));
