import { create } from 'zustand';
import type { ConversationMessageTypes } from '../types';

interface InternalNoteReplyStore {
  message: ConversationMessageTypes.ConversationMessage | null;
  setMessage: (message: ConversationMessageTypes.ConversationMessage) => void;
  clearMessage: () => void;
  isReplying: (messageUuid: string) => boolean;
}

export const useInternalNoteReplyStore = create<InternalNoteReplyStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isReplying: (messageUuid) => get().message?.uuid === messageUuid,
}));
