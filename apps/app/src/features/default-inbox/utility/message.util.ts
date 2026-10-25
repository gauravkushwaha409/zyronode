import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '../types';

export interface MessageGroup {
  date: string;
  label: string;
  messages: Message.ConversationMessage[];
}

export interface MessageCluster {
  senderType: Message.ConversationMessage['sender_type'];
  sender: Message.MessageSender;
  messages: Message.ConversationMessage[];
}

export function formatMessageTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function groupMessagesByDate(
  messages: Message.ConversationMessage[],
): MessageGroup[] {
  const groups: Record<string, Message.ConversationMessage[]> = {};

  for (const message of messages) {
    const date = new Date(message.created_at);
    const dateKey = format(date, 'yyyy-MM-dd');
    groups[dateKey] ??= [];
    groups[dateKey].push(message);
  }

  return Object.entries(groups).map(([dateKey, msgs]) => {
    const date = new Date(dateKey);
    let label: string;

    if (isToday(date)) {
      label = 'Today';
    } else if (isYesterday(date)) {
      label = 'Yesterday';
    } else {
      label = format(date, 'd MMM yyyy');
    }

    return { date: dateKey, label, messages: msgs };
  });
}

export function groupConsecutiveMessages(
  messages: Message.ConversationMessage[],
): MessageCluster[] {
  const clusters: MessageCluster[] = [];

  for (const message of messages) {
    const lastCluster = clusters[clusters.length - 1];

    if (lastCluster && lastCluster.senderType === message.sender_type) {
      lastCluster.messages.push(message);
    } else {
      clusters.push({
        senderType: message.sender_type,
        sender: message.sender,
        messages: [message],
      });
    }
  }

  return clusters;
}
