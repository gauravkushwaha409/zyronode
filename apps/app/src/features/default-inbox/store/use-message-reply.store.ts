import { create } from 'zustand';
import type { Message } from '../types';

interface MessageReplyStore {
  message: Message.ConversationMessage | null;
  setMessage: (message: Message.ConversationMessage) => void;
  clearMessage: () => void;
  isReplying: (messageUuid: string) => boolean;
}

export const useMessageReplyStore = create<MessageReplyStore>((set, get) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
  isReplying: (messageUuid) => get().message?.uuid === messageUuid,
}));
