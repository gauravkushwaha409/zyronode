import { create } from 'zustand';
import type { ConversationMessageTypes } from '../types';

interface InternalNoteEditStore {
  message: ConversationMessageTypes.ConversationMessage | null;
  setMessage: (message: ConversationMessageTypes.ConversationMessage) => void;
  clearMessage: () => void;
  isEditing: (messageUuid: string) => boolean;
}

export const useInternalNoteEditStore = create<InternalNoteEditStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isEditing: (messageUuid) => get().message?.uuid === messageUuid,
}));
